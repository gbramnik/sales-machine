import { supabase } from '../lib/supabase';
import { SMTPService } from './SMTPService';
import { ApiError, ErrorCode } from '../types';

/**
 * Notification Service
 * 
 * Handles notifications for daily prospect detection:
 * - Email notifications for autopilot and semi-auto modes
 * - In-app notifications (via audit_log)
 */

export interface ProspectSummary {
  id: string;
  full_name: string;
  company_name: string;
  job_title: string | null;
  linkedin_url: string | null;
}

export interface NotificationPreferences {
  email?: boolean;
  in_app?: boolean;
}

export class NotificationService {
  private smtpService: SMTPService;

  constructor() {
    this.smtpService = new SMTPService('mailgun');
  }

  /**
   * Send daily prospect notification
   * 
   * @param userId - User ID
   * @param prospectCount - Number of prospects detected
   * @param prospectList - List of prospects
   * @param mode - Detection mode (autopilot or semi-auto)
   */
  async sendDailyProspectNotification(
    userId: string,
    prospectCount: number,
    prospectList: ProspectSummary[],
    mode: 'autopilot' | 'semi_auto'
  ): Promise<void> {
    // Get user and notification preferences
    const { data: user, error } = await supabase
      .from('users')
      .select('email, full_name, notification_preferences')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    const preferences = (user.notification_preferences as NotificationPreferences) || {};
    const sendEmail = preferences.email !== false; // Default to true if not set
    const sendInApp = preferences.in_app !== false; // Default to true if not set

    // Send email notification
    if (sendEmail) {
      try {
        await this.sendEmailNotification(
          user.email,
          user.full_name || 'User',
          prospectCount,
          prospectList,
          mode
        );
      } catch (error) {
        console.error('Failed to send email notification:', error);
        // Don't fail the entire operation if email fails
      }
    }

    // Store in-app notification (via audit_log)
    if (sendInApp) {
      try {
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            event_type: 'daily_prospects_detected',
            entity_type: 'prospect',
            new_values: {
              mode,
              prospect_count: prospectCount,
              prospects: prospectList.map(p => ({
                id: p.id,
                name: p.full_name,
                company: p.company_name,
                job_title: p.job_title,
                linkedin_url: p.linkedin_url,
              })),
            },
          });
      } catch (error) {
        console.error('Failed to store in-app notification:', error);
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userEmail: string,
    userName: string,
    prospectCount: number,
    prospectList: ProspectSummary[],
    mode: 'autopilot' | 'semi_auto'
  ): Promise<void> {
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
    
    let subject: string;
    let html: string;

    if (mode === 'autopilot') {
      subject = `${prospectCount} new prospects added to your pipeline`;
      html = this.generateAutopilotEmailHtml(userName, prospectCount, prospectList, apiGatewayUrl);
    } else {
      subject = `${prospectCount} new prospects detected - Review required`;
      html = this.generateSemiAutoEmailHtml(userName, prospectCount, prospectList, apiGatewayUrl);
    }

    // Get SMTP credentials from api_credentials
    const { data: smtpCreds } = await supabase
      .from('api_credentials')
      .select('metadata, api_key')
      .eq('service_name', 'smtp')
      .eq('is_active', true)
      .single();

    if (!smtpCreds) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'SMTP credentials not configured',
        400
      );
    }

    const credentials = {
      api_key: smtpCreds.api_key,
      domain: smtpCreds.metadata?.domain,
      from_email: smtpCreds.metadata?.from_email || 'noreply@salesmachine.io',
    };

    await this.smtpService.sendEmail(
      {
        to: userEmail,
        subject,
        body: html,
        from: credentials.from_email,
      },
      credentials
    );
  }

  /**
   * Generate HTML for autopilot mode email
   */
  private generateAutopilotEmailHtml(
    userName: string,
    prospectCount: number,
    prospectList: ProspectSummary[],
    apiGatewayUrl: string
  ): string {
    const prospectRows = prospectList
      .slice(0, 10) // Show first 10 in email
      .map(p => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${p.full_name}</strong><br>
            ${p.job_title || ''} at ${p.company_name}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <a href="${p.linkedin_url || '#'}" style="color: #0077b5;">View Profile</a>
          </td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0077b5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; }
          .button { display: inline-block; padding: 12px 24px; background: #0077b5; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 ${prospectCount} New Prospects Added</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Great news! We've automatically detected and added <strong>${prospectCount} new prospects</strong> to your pipeline. Warm-up has started automatically.</p>
            
            <h3>Today's Prospects:</h3>
            <table>
              ${prospectRows}
            </table>
            
            ${prospectCount > 10 ? `<p><em>... and ${prospectCount - 10} more prospects. View all in your dashboard.</em></p>` : ''}
            
            <a href="${apiGatewayUrl}/dashboard/prospects" class="button">View All Prospects</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated notification from Sales Machine.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for semi-auto mode email
   */
  private generateSemiAutoEmailHtml(
    userName: string,
    prospectCount: number,
    prospectList: ProspectSummary[],
    apiGatewayUrl: string
  ): string {
    const prospectRows = prospectList
      .slice(0, 10)
      .map(p => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${p.full_name}</strong><br>
            ${p.job_title || ''} at ${p.company_name}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <a href="${apiGatewayUrl}/api/validation-queue/${p.id}/approve?token=${encodeURIComponent(process.env.API_SERVICE_TOKEN || '')}" 
               style="background: #28a745; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; margin-right: 8px;">Approve</a>
            <a href="${apiGatewayUrl}/api/validation-queue/${p.id}/reject?token=${encodeURIComponent(process.env.API_SERVICE_TOKEN || '')}" 
               style="background: #dc3545; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px;">Reject</a>
          </td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; }
          .button { display: inline-block; padding: 12px 24px; background: #0077b5; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔍 ${prospectCount} Prospects Require Review</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We've detected <strong>${prospectCount} new prospects</strong> matching your ICP criteria. Please review and approve them to start the warm-up process.</p>
            
            <h3>Prospects Pending Review:</h3>
            <table>
              ${prospectRows}
            </table>
            
            ${prospectCount > 10 ? `<p><em>... and ${prospectCount - 10} more prospects. View all in your dashboard.</em></p>` : ''}
            
            <a href="${apiGatewayUrl}/dashboard/validation-queue" class="button">Review All Prospects</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated notification from Sales Machine.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Notify user about pending AI review queue items
   * 
   * @param userId - User ID
   * @param count - Number of pending reviews
   * @param urgent - Whether any reviews are urgent (confidence < 60 or VIP)
   * @param vipCount - Number of VIP reviews (optional)
   * @param nonVipCount - Number of non-VIP reviews (optional)
   */
  async notifyPendingReview(
    userId: string,
    count: number,
    urgent: boolean = false,
    vipCount?: number,
    nonVipCount?: number
  ): Promise<void> {
    // Get user and notification preferences
    const { data: user, error } = await supabase
      .from('users')
      .select('email, full_name, notification_preferences')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    const preferences = (user.notification_preferences as NotificationPreferences) || {};
    const sendEmail = preferences.email !== false; // Default to true if not set
    const sendInApp = preferences.in_app !== false; // Default to true if not set

    // Get pending reviews for email content (include VIP status)
    const { data: reviews } = await supabase
      .from('ai_review_queue')
      .select(`
        id,
        ai_confidence_score,
        requires_immediate_attention,
        prospect:prospects!inner(full_name, company_name, is_vip)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20); // Get more to separate VIP and non-VIP

    // Separate VIP and non-VIP reviews
    const vipReviews = (reviews || []).filter((r: any) => r.prospect?.is_vip === true);
    const nonVipReviews = (reviews || []).filter((r: any) => !r.prospect?.is_vip);

    // Calculate counts if not provided
    const actualVipCount = vipCount !== undefined ? vipCount : vipReviews.length;
    const actualNonVipCount = nonVipCount !== undefined ? nonVipCount : nonVipReviews.length;

    // Update urgent flag if VIP reviews exist
    const isUrgent = urgent || actualVipCount > 0 || (reviews || []).some((r: any) => (r.ai_confidence_score || 100) < 60);

    // Send email notification
    if (sendEmail) {
      try {
        await this.sendReviewNotificationEmail(
          user.email,
          user.full_name || 'User',
          count,
          vipReviews,
          nonVipReviews,
          isUrgent,
          actualVipCount,
          actualNonVipCount
        );
      } catch (error) {
        console.error('Failed to send review notification email:', error);
      }
    }

    // Store in-app notification (via audit_log)
    if (sendInApp) {
      try {
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            event_type: 'ai_review_pending',
            entity_type: 'ai_review_queue',
            new_values: {
              count,
              urgent,
              review_ids: (reviews || []).map(r => r.id),
            },
          });
      } catch (error) {
        console.error('Failed to store in-app notification:', error);
      }
    }
  }

  /**
   * Send email notification for pending reviews
   */
  private async sendReviewNotificationEmail(
    userEmail: string,
    userName: string,
    count: number,
    vipReviews: Array<any>,
    nonVipReviews: Array<any>,
    urgent: boolean,
    vipCount: number,
    nonVipCount: number
  ): Promise<void> {
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
    
    const subject = urgent
      ? `🚨 URGENT: ${vipCount} VIP + ${nonVipCount} regular message(s) require review`
      : `${vipCount} VIP + ${nonVipCount} regular message(s) awaiting review`;

    // Generate VIP review rows (highlighted)
    const vipReviewRows = vipReviews
      .slice(0, 10)
      .map((r: any) => {
        const prospectName = r.prospect?.full_name || 'Unknown';
        const companyName = r.prospect?.company_name || 'Unknown';
        const score = r.ai_confidence_score || 0;
        const isUrgent = r.requires_immediate_attention || score < 60;
        
        return `
          <tr style="background: #fff3cd;">
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <strong>🏆 ${prospectName}</strong><br>
              ${companyName}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              ${score}% ${isUrgent ? '<span style="color: #dc3545;">🚨 URGENT</span>' : ''}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <a href="${apiGatewayUrl}/dashboard/ai-review-queue" style="color: #0077b5;">Review</a>
            </td>
          </tr>
        `;
      })
      .join('');

    // Generate non-VIP review rows
    const nonVipReviewRows = nonVipReviews
      .slice(0, 10)
      .map((r: any) => {
        const prospectName = r.prospect?.full_name || 'Unknown';
        const companyName = r.prospect?.company_name || 'Unknown';
        const score = r.ai_confidence_score || 0;
        const isUrgent = r.requires_immediate_attention || score < 60;
        
        return `
          <tr style="${isUrgent ? 'background: #fff3cd;' : ''}">
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <strong>${prospectName}</strong><br>
              ${companyName}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              ${score}% ${isUrgent ? '<span style="color: #dc3545;">🚨 URGENT</span>' : ''}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <a href="${apiGatewayUrl}/dashboard/ai-review-queue" style="color: #0077b5;">Review</a>
            </td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${urgent ? '#dc3545' : '#ffc107'}; color: ${urgent ? 'white' : '#333'}; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; }
          .button { display: inline-block; padding: 12px 24px; background: #0077b5; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${urgent ? '🚨' : '🔍'} ${count} Message${count > 1 ? 's' : ''} Require${count > 1 ? '' : 's'} Review</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>You have <strong>${count} AI-generated message${count > 1 ? 's' : ''}</strong> awaiting your review. ${urgent ? '<strong style="color: #dc3545;">Some messages have very low confidence scores or are from VIP accounts and require immediate attention.</strong>' : ''}</p>
            
            ${vipCount > 0 ? `
            <h3 style="color: #ffc107; margin-top: 20px;">🏆 VIP Accounts (${vipCount}):</h3>
            <table>
              <thead>
                <tr>
                  <th style="padding: 8px; border-bottom: 2px solid #ffc107;">Prospect</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ffc107;">Confidence</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ffc107;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${vipReviewRows}
              </tbody>
            </table>
            ${vipCount > 10 ? `<p><em>... and ${vipCount - 10} more VIP reviews. View all in your dashboard.</em></p>` : ''}
            ` : ''}
            
            ${nonVipCount > 0 ? `
            <h3 style="margin-top: 20px;">Regular Accounts (${nonVipCount}):</h3>
            <table>
              <thead>
                <tr>
                  <th style="padding: 8px; border-bottom: 2px solid #0077b5;">Prospect</th>
                  <th style="padding: 8px; border-bottom: 2px solid #0077b5;">Confidence</th>
                  <th style="padding: 8px; border-bottom: 2px solid #0077b5;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${nonVipReviewRows}
              </tbody>
            </table>
            ${nonVipCount > 10 ? `<p><em>... and ${nonVipCount - 10} more regular reviews. View all in your dashboard.</em></p>` : ''}
            ` : ''}
            
            ${count > 10 ? `<p><em>... and ${count - 10} more reviews. View all in your dashboard.</em></p>` : ''}
            
            <a href="${apiGatewayUrl}/dashboard/ai-review-queue" class="button">Review All Messages</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated notification from Sales Machine.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Get SMTP credentials
    const { data: smtpCreds } = await supabase
      .from('api_credentials')
      .select('metadata, api_key')
      .eq('service_name', 'smtp')
      .eq('is_active', true)
      .single();

    if (!smtpCreds) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'SMTP credentials not configured',
        400
      );
    }

    const credentials = {
      api_key: smtpCreds.api_key,
      domain: smtpCreds.metadata?.domain,
      from_email: smtpCreds.metadata?.from_email || 'noreply@salesmachine.io',
    };

    await this.smtpService.sendEmail(
      {
        to: userEmail,
        subject,
        body: html,
        from: credentials.from_email,
      },
      credentials
    );
  }
}

