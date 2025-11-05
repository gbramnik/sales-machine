import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { smtpService } from '../services/SMTPService';
import { meetingBookingService } from '../services/meeting-booking.service';

export async function webhooksRoutes(server: FastifyInstance) {
  // SMTP provider webhook endpoint for email events (Story 1.5 - Task 8)
  server.post('/smtp/email-event', {
    schema: {
      body: {
        type: 'object',
        // Mailgun webhook payload structure
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as any;

    try {
      // Parse Mailgun webhook payload
      const event = smtpService.parseWebhookPayload(payload);

      // Update campaign metrics based on event type
      if (event.event_type === 'bounce' || event.event_type === 'spam_complaint') {
        // Find campaign and prospect by message_id
        const { data: conversation } = await supabase
          .from('ai_conversation_log')
          .select('campaign_id, prospect_id, user_id')
          .eq('email_message_id', event.message_id)
          .single();

        if (conversation) {
          // Get current campaign metrics
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('bounce_count, spam_complaint_count, contacted_count')
            .eq('id', conversation.campaign_id)
            .single();

          if (campaign) {
            let updates: any = {};

            // Update bounce/spam counts
            if (event.event_type === 'bounce') {
              const newBounceCount = (campaign.bounce_count || 0) + 1;
              const totalSent = campaign.contacted_count || 1;
              const bounceRate = (newBounceCount / totalSent) * 100;

              updates.bounce_count = newBounceCount;
              updates.bounce_rate = parseFloat(bounceRate.toFixed(2));

              // Update prospect status if bounced
              await supabase
                .from('prospects')
                .update({ status: 'bounced' })
                .eq('id', conversation.prospect_id);
            } else if (event.event_type === 'spam_complaint') {
              const newSpamCount = (campaign.spam_complaint_count || 0) + 1;
              const totalSent = campaign.contacted_count || 1;
              const spamRate = (newSpamCount / totalSent) * 100;

              updates.spam_complaint_count = newSpamCount;
              updates.spam_complaint_rate = parseFloat(spamRate.toFixed(2));
            }

            // Update campaign metrics
            if (Object.keys(updates).length > 0) {
              await supabase
                .from('campaigns')
                .update(updates)
                .eq('id', conversation.campaign_id);
            }
          }
        }
      }

      // Update conversation log with event
      await supabase
        .from('ai_conversation_log')
        .update({
          metadata: {
            last_event: event.event_type,
            last_event_at: event.timestamp,
          },
        })
        .eq('email_message_id', event.message_id);

      return reply.send({
        success: true,
        message: 'Event processed successfully',
      });
    } catch (err: any) {
      server.log.error('Error processing SMTP webhook:', err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process email event',
      });
    }
  });

  // N8N webhook endpoint for scraping failures
  server.post('/n8n/scraping-failed', {
    schema: {
      body: {
        type: 'object',
        properties: {
          user_id: { type: 'string', format: 'uuid' },
          campaign_id: { type: 'string', format: 'uuid' },
          error: { type: 'string' },
          execution_id: { type: 'string' },
        },
        required: ['user_id', 'campaign_id', 'error'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { user_id, campaign_id, error, execution_id } = request.body as {
      user_id: string;
      campaign_id: string;
      error: string;
      execution_id?: string;
    };

    try {
      // Log error to audit_log table (if it exists) or automation_logs
      const { error: insertError } = await supabase
        .from('automation_logs')
        .insert({
          user_id,
          campaign_id,
          automation_type: 'list_creation',
          status: 'failed',
          action: 'linkedin_scraping',
          message: `LinkedIn scraping failed: ${error}`,
          error_details: {
            error,
            execution_id,
            timestamp: new Date().toISOString(),
          },
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        server.log.error(`Failed to log scraping error: ${insertError.message}`);
      }

      // Update campaign status if needed
      await supabase
        .from('campaigns')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaign_id)
        .eq('user_id', user_id);

      return reply.send({
        success: true,
        message: 'Error logged successfully',
      });
    } catch (err: any) {
      server.log.error('Error processing scraping failure webhook:', err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process error notification',
      });
    }
  });

  // Cal.com meeting booking webhook (Story 1.7 - Task 5)
  server.post('/cal/meeting-booked', {
    schema: {
      body: {
        type: 'object',
        // Cal.com webhook payload structure
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as any;

    try {
      // Parse Cal.com webhook payload
      const event = meetingBookingService.parseWebhookPayload(payload);

      // Extract prospect_id from metadata or map from email
      let prospectId = event.metadata?.prospect_id;
      
      if (!prospectId && event.prospect_email) {
        // Map prospect_email to prospect_id
        // Note: prospects table doesn't have user_id directly, need to join via list_id
        const { data: prospectData } = await supabase
          .from('prospects')
          .select(`
            id,
            name,
            company,
            list_id,
            lists!inner(user_id)
          `)
          .eq('email', event.prospect_email)
          .single();

        if (!prospectData) {
          server.log.warn(`Prospect not found for email: ${event.prospect_email}`);
          return reply.send({
            success: false,
            error: 'Prospect not found',
          });
        }

        prospectId = prospectData.id;
        const userId = (prospectData.lists as any)?.user_id;
        const prospect = {
          id: prospectData.id,
          name: prospectData.name,
          company: prospectData.company,
          user_id: userId,
          linkedin_url: (prospectData as any).linkedin_url || null,
        };

        // Handle meeting booked event
        if (event.event_type === 'booked') {
          // Fetch enrichment for meeting description
          const { data: enrichment } = await supabase
            .from('prospect_enrichment')
            .select('talking_points, company_insights')
            .eq('prospect_id', prospectId)
            .single();

          const meetingTopic = enrichment?.talking_points?.[0] || 'Discovery Call';

          // Insert meeting record
          const { data: meeting, error: meetingError } = await supabase
            .from('meetings')
            .insert({
              prospect_id: prospectId,
              user_id: prospect.user_id,
              title: `Discovery Call: ${prospect.name} - ${prospect.company || ''}`,
              description: `Meeting with ${prospect.name} from ${prospect.company || ''}. Topic: ${meetingTopic}`,
              scheduled_at: event.scheduled_time,
              duration_minutes: 30,
              calendar_event_id: event.booking_id,
              calendar_provider: 'cal_com',
              status: 'scheduled',
              attendees: [{
                email: event.prospect_email,
                name: event.prospect_name || prospect.name,
              }] as any, // JSONB array
              meeting_type: 'discovery',
            })
            .select()
            .single();

          if (meetingError) {
            const errorMsg = meetingError.message || String(meetingError);
            server.log.error(`Failed to create meeting record: ${errorMsg}`);
            throw new Error(`Failed to create meeting: ${errorMsg}`);
          }

          // Update prospect status
          await supabase
            .from('prospects')
            .update({
              status: 'meeting_booked',
              updated_at: new Date().toISOString(),
            })
            .eq('id', prospectId);

          // Send notification email to user (Story 1.7 - Task 7)
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', userId)
            .single();

          if (user?.email) {
            try {
              // Get SMTP credentials
              const { data: smtpCreds } = await supabase
                .from('api_credentials')
                .select('metadata')
                .eq('user_id', userId)
                .eq('service_name', 'smtp_mailgun')
                .eq('is_active', true)
                .single();

              if (smtpCreds) {
                const smtpConfig = smtpCreds.metadata || {};
                const systemEmail = smtpConfig.from_email || process.env.SYSTEM_EMAIL || 'noreply@sales-machine.com';

                const emailSubject = `New Meeting Booked: ${prospect.name} - ${prospect.company || ''}`;
                const emailBody = `
                  <h2>New Meeting Booked</h2>
                  <p><strong>Prospect:</strong> ${prospect.name}</p>
                  <p><strong>Company:</strong> ${prospect.company || 'N/A'}</p>
                  <p><strong>Meeting Time:</strong> ${new Date(event.scheduled_time).toLocaleString()}</p>
                  <p><strong>Duration:</strong> 30 minutes</p>
                  <p><strong>Topic:</strong> ${meetingTopic}</p>
                  ${prospect.linkedin_url ? `<p><strong>LinkedIn:</strong> <a href="${prospect.linkedin_url}">View Profile</a></p>` : ''}
                `;

                await smtpService.sendEmail(
                  {
                    to: user.email,
                    from: systemEmail,
                    subject: emailSubject,
                    body: emailBody,
                  },
                  {
                    api_key: smtpConfig.api_key,
                    domain: smtpConfig.domain,
                    from_email: systemEmail,
                  }
                );
              }
            } catch (emailError: any) {
              server.log.error('Failed to send meeting notification email:', emailError?.message || emailError);
              // Don't fail the webhook if email fails
            }
          }

          return reply.send({
            success: true,
            message: 'Meeting booked successfully',
            meeting_id: meeting.id,
          });
        }
      }

      // Handle meeting cancelled event (Story 1.7 - Task 8)
      if (event.event_type === 'cancelled') {
        // Find meeting by calendar_event_id
        const { data: meeting } = await supabase
          .from('meetings')
          .select('id, prospect_id, user_id')
          .eq('calendar_event_id', event.booking_id)
          .single();

        if (meeting) {
          // Update meeting status
          await supabase
            .from('meetings')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              cancellation_reason: 'Cancelled by prospect',
            })
            .eq('id', meeting.id);

          // Update prospect status
          await supabase
            .from('prospects')
            .update({ status: 'meeting_cancelled' })
            .eq('id', meeting.prospect_id);

          // Send cancellation notification
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', meeting.user_id)
            .single();

          if (user?.email) {
            try {
              const { data: smtpCreds } = await supabase
                .from('api_credentials')
                .select('metadata')
                .eq('user_id', meeting.user_id)
                .eq('service_name', 'smtp_mailgun')
                .eq('is_active', true)
                .single();

              if (smtpCreds) {
                const smtpConfig = smtpCreds.metadata || {};
                const systemEmail = smtpConfig.from_email || process.env.SYSTEM_EMAIL || 'noreply@sales-machine.com';

                await smtpService.sendEmail(
                  {
                    to: user.email,
                    from: systemEmail,
                    subject: `Meeting Cancelled: ${event.prospect_name || 'Prospect'}`,
                    body: `<p>A meeting has been cancelled.</p><p><strong>Original Time:</strong> ${new Date(event.scheduled_time).toLocaleString()}</p>`,
                  },
                  {
                    api_key: smtpConfig.api_key,
                    domain: smtpConfig.domain,
                    from_email: systemEmail,
                  }
                );
              }
            } catch (emailError: any) {
              server.log.error('Failed to send cancellation notification:', emailError?.message || emailError);
            }
          }
        }

        return reply.send({
          success: true,
          message: 'Meeting cancellation processed',
        });
      }

      return reply.send({
        success: true,
        message: 'Webhook processed successfully',
      });
    } catch (err: any) {
      server.log.error('Error processing Cal.com webhook:', err?.message || err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process meeting booking webhook',
        details: err?.message || 'Unknown error',
      });
    }
  });

  // Email reply webhook (Story 1.6 - Task 1)
  server.post('/smtp/email-reply', {
    schema: {
      body: {
        type: 'object',
        // Mailgun/SendGrid email reply webhook payload structure
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as any;

    try {
      // Parse email reply webhook payload
      // Mailgun format: { event-data: { message: { headers: {...}, body: {...} }, recipient: string } }
      // SendGrid format: { event: 'inbound', email: string, text: string, headers: {...} }
      
      const prospectEmail = payload['event-data']?.message?.headers?.['From'] ||
                            payload['event-data']?.recipient ||
                            payload.email ||
                            payload.from;
      
      const replyText = payload['event-data']?.message?.body?.text ||
                       payload['event-data']?.message?.body?.plain ||
                       payload.text ||
                       payload.body;

      if (!prospectEmail || !replyText) {
        return reply.status(400).send({
          success: false,
          error: 'Missing required fields: email or reply_text',
        });
      }

      // Forward to N8N workflow for processing
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';
      const webhookPath = `${n8nWebhookUrl}/webhooks/smtp/email-reply`;

      // Store webhook payload for N8N processing (optional - table may not exist)
      try {
        await supabase
          .from('webhook_queue')
          .insert({
            webhook_type: 'email_reply',
            payload: payload,
            processed: false,
            created_at: new Date().toISOString(),
          });
      } catch (error) {
        // If webhook_queue table doesn't exist, log warning
        server.log.warn('webhook_queue table not found, skipping queue storage');
      }

      // Call N8N workflow (if configured)
      if (n8nWebhookUrl) {
        try {
          await fetch(webhookPath, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }).catch(() => {
            // N8N workflow may not be active, continue
            server.log.warn('N8N webhook not available, workflow may not be active');
          });
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          server.log.error(`Failed to forward to N8N: ${errorMsg}`);
        }
      }

      return reply.send({
        success: true,
        message: 'Email reply webhook received',
      });
    } catch (err: any) {
      server.log.error('Error processing email reply webhook:', err?.message || err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process email reply webhook',
        details: err?.message || 'Unknown error',
      });
    }
  });

  // LinkedIn reply webhook (Story 1.6 - Task 1)
  server.post('/unipil/linkedin-reply', {
    schema: {
      body: {
        type: 'object',
        // UniPil LinkedIn reply webhook payload structure
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as any;

    try {
      // Parse UniPil LinkedIn reply webhook payload
      // Format TBD - verify with UniPil API documentation
      // Expected: { message_id: string, linkedin_url: string, message_text: string, sender_info: {...}, timestamp: string }
      
      const prospectLinkedinUrl = payload.linkedin_url || payload.profile_url || payload.sender?.profile_url;
      const replyText = payload.message_text || payload.text || payload.message || payload.body;

      if (!prospectLinkedinUrl || !replyText) {
        return reply.status(400).send({
          success: false,
          error: 'Missing required fields: linkedin_url or reply_text',
        });
      }

      // Forward to N8N workflow for processing
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';
      const webhookPath = `${n8nWebhookUrl}/webhooks/unipil/linkedin-reply`;

      // Store webhook payload for N8N processing (optional - table may not exist)
      try {
        await supabase
          .from('webhook_queue')
          .insert({
            webhook_type: 'linkedin_reply',
            payload: payload,
            processed: false,
            created_at: new Date().toISOString(),
          });
      } catch (error) {
        // If webhook_queue table doesn't exist, log warning
        server.log.warn('webhook_queue table not found, skipping queue storage');
      }

      // Call N8N workflow (if configured)
      if (n8nWebhookUrl) {
        try {
          await fetch(webhookPath, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }).catch(() => {
            // N8N workflow may not be active, continue
            server.log.warn('N8N webhook not available, workflow may not be active');
          });
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          server.log.error(`Failed to forward to N8N: ${errorMsg}`);
        }
      }

      return reply.send({
        success: true,
        message: 'LinkedIn reply webhook received',
      });
    } catch (err: any) {
      server.log.error('Error processing LinkedIn reply webhook:', err?.message || err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to process LinkedIn reply webhook',
        details: err?.message || 'Unknown error',
      });
    }
  });
}

