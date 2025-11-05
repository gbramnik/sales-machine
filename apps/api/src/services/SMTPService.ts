import { ApiError, ErrorCode } from '../types';

/**
 * SMTP Email Service
 * 
 * Handles email sending via Mailgun SMTP/API.
 * Supports both SMTP and REST API methods.
 * 
 * Provider: Mailgun (EU servers for GDPR compliance)
 * Documentation: https://documentation.mailgun.com/
 */

// Configuration
const MAILGUN_API_URL = process.env.MAILGUN_API_URL || 'https://api.eu.mailgun.net/v3';
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

// Types
export interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from_email: string;
  secure?: boolean; // true for SSL/TLS (port 465), false for STARTTLS (port 587)
  provider: 'mailgun' | 'sendgrid' | 'ses';
}

export interface EmailParams {
  to: string;
  subject: string;
  body: string; // HTML or plain text
  from: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailResult {
  message_id: string;
  provider_message_id: string;
  status: 'queued' | 'sent' | 'failed';
  provider_response?: any;
}

export interface SMTPCredentials {
  api_key?: string;
  domain?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  from_email: string;
}

export class SMTPService {
  private provider: 'mailgun' | 'sendgrid' | 'ses';
  
  constructor(provider: 'mailgun' | 'sendgrid' | 'ses' = 'mailgun') {
    this.provider = provider;
  }

  /**
   * Send email via Mailgun API (preferred method)
   * 
   * @param params - Email parameters
   * @param credentials - SMTP credentials from database
   * @returns Email result with message_id
   */
  async sendEmail(
    params: EmailParams,
    credentials: SMTPCredentials
  ): Promise<EmailResult> {
    if (this.provider !== 'mailgun') {
      throw new ApiError(
        ErrorCode.INVALID_REQUEST,
        `Provider ${this.provider} not yet implemented. Only Mailgun is supported.`,
        400
      );
    }

    const apiKey = credentials.api_key || MAILGUN_API_KEY;
    const domain = credentials.domain || MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'Mailgun API key and domain are required',
        400
      );
    }

    // Build Mailgun API request
    const apiUrl = `${MAILGUN_API_URL}/${domain}/messages`;
    
    // Mailgun requires form-data format (URLSearchParams for Node.js compatibility)
    const formData = new URLSearchParams();
    formData.append('from', params.from);
    formData.append('to', params.to);
    formData.append('subject', params.subject);
    formData.append('html', params.body);
    
    if (params.reply_to) {
      formData.append('h:Reply-To', params.reply_to);
    }
    
    if (params.cc && params.cc.length > 0) {
      formData.append('cc', params.cc.join(','));
    }
    
    if (params.bcc && params.bcc.length > 0) {
      formData.append('bcc', params.bcc.join(','));
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        throw new ApiError(
          ErrorCode.SERVICE_UNAVAILABLE,
          `Mailgun API error: ${(responseData as any)?.message || response.statusText}`,
          response.status,
          responseData
        );
      }

      return {
        message_id: (responseData as any)?.id || (responseData as any)?.message || 'unknown',
        provider_message_id: (responseData as any)?.id || (responseData as any)?.message || 'unknown',
        status: 'queued' as const, // Mailgun queues emails
        provider_response: responseData,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        `Failed to send email via Mailgun: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Send email via SMTP (alternative method using nodemailer)
   * Note: This method requires nodemailer package
   * 
   * @param params - Email parameters
   * @param credentials - SMTP credentials
   * @returns Email result
   */
  async sendEmailViaSMTP(
    params: EmailParams,
    credentials: SMTPCredentials
  ): Promise<EmailResult> {
    // Try to use nodemailer if available
    try {
      // Dynamic import to avoid requiring nodemailer if not installed
      // Note: nodemailer is optional - install with: npm install nodemailer @types/nodemailer
      // @ts-ignore - nodemailer is optional dependency
      const nodemailer = await import('nodemailer').catch(() => null);
      
      if (!nodemailer) {
        throw new Error('nodemailer not installed');
      }
      
      // @ts-ignore - nodemailer types may not be available
      const transporter = nodemailer.createTransport({
        host: credentials.smtp_host || 'smtp.eu.mailgun.org',
        port: credentials.smtp_port || 587,
        secure: credentials.smtp_port === 465, // true for 465, false for other ports
        auth: {
          user: credentials.smtp_user || credentials.api_key,
          pass: credentials.smtp_password || credentials.api_key,
        },
      });

      const mailOptions = {
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.body,
        replyTo: params.reply_to,
        cc: params.cc,
        bcc: params.bcc,
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        message_id: info.messageId || 'unknown',
        provider_message_id: info.messageId || 'unknown',
        status: 'sent',
        provider_response: info,
      };
    } catch (error) {
      // If nodemailer is not installed, fall back to API method
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.warn('nodemailer not installed, falling back to API method');
        return this.sendEmail(params, credentials);
      }

      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        `Failed to send email via SMTP: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Verify SMTP credentials by testing connection
   * 
   * @param credentials - SMTP credentials to verify
   * @returns true if credentials are valid, false otherwise
   */
  async verifyCredentials(credentials: SMTPCredentials): Promise<boolean> {
    try {
      // For Mailgun, verify API key by making a test API call
      if (credentials.api_key && credentials.domain) {
        const apiUrl = `${MAILGUN_API_URL}/${credentials.domain}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${credentials.api_key}`).toString('base64')}`,
          },
        });

        return response.ok;
      }

      // For SMTP credentials, try to create a connection
      if (credentials.smtp_host && credentials.smtp_user && credentials.smtp_password) {
        try {
          // @ts-ignore - nodemailer is optional dependency
          const nodemailer = await import('nodemailer').catch(() => null);
          
          if (!nodemailer) {
            return false;
          }
          
          // @ts-ignore - nodemailer types may not be available
          const transporter = nodemailer.createTransport({
            host: credentials.smtp_host,
            port: credentials.smtp_port || 587,
            secure: credentials.smtp_port === 465,
            auth: {
              user: credentials.smtp_user,
              pass: credentials.smtp_password,
            },
          });

          await transporter.verify();
          return true;
        } catch (error) {
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('SMTP credential verification error:', error);
      return false;
    }
  }

  /**
   * Parse Mailgun webhook payload
   * 
   * @param payload - Raw webhook payload from Mailgun
   * @returns Normalized event data
   */
  parseWebhookPayload(payload: any): {
    event_type: 'bounce' | 'spam_complaint' | 'open' | 'click' | 'reply' | 'delivered' | 'failed';
    message_id: string;
    recipient: string;
    timestamp: string;
    reason?: string;
    error_code?: string;
  } {
    const eventType = payload.event || payload['event-data']?.event;
    const messageId = payload.message?.headers['message-id'] || payload['message-id'] || payload['event-data']?.message?.headers['message-id'];
    const recipient = payload.recipient || payload['event-data']?.recipient;
    const timestamp = payload.timestamp || payload['event-data']?.timestamp;

    // Map Mailgun event types to our normalized types
    const eventMap: Record<string, 'bounce' | 'spam_complaint' | 'open' | 'click' | 'reply' | 'delivered' | 'failed'> = {
      'bounced': 'bounce',
      'complained': 'spam_complaint',
      'opened': 'open',
      'clicked': 'click',
      'replied': 'reply',
      'delivered': 'delivered',
      'failed': 'failed',
    };

    return {
      event_type: eventMap[eventType] || 'delivered',
      message_id: messageId || 'unknown',
      recipient: recipient || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      reason: payload.reason || payload['event-data']?.reason,
      error_code: payload['delivery-status']?.code || payload['event-data']?.delivery?.status?.code,
    };
  }

  /**
   * Get email delivery status from Mailgun API
   * 
   * @param messageId - Mailgun message ID
   * @param credentials - SMTP credentials
   * @returns Delivery status
   */
  async getDeliveryStatus(
    _messageId: string,
    credentials: SMTPCredentials
  ): Promise<{
    status: 'delivered' | 'bounced' | 'failed' | 'unknown';
    delivered_at?: string;
    bounced_at?: string;
    error?: string;
  }> {
    const apiKey = credentials.api_key || MAILGUN_API_KEY;
    const domain = credentials.domain || MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'Mailgun API key and domain are required',
        400
      );
    }

    try {
      // Mailgun doesn't have a direct message status endpoint
      // Status is typically received via webhooks
      // This is a placeholder for future implementation
      return {
        status: 'unknown',
      };
    } catch (error) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        `Failed to get delivery status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Handle bounce notification from webhook
   * 
   * @param bounceData - Parsed webhook payload (from parseWebhookPayload)
   * @returns Processing result
   */
  async handleBounce(bounceData: ReturnType<SMTPService['parseWebhookPayload']>): Promise<{
    processed: boolean;
    prospect_id?: string;
    status_updated?: string;
  }> {
    if (bounceData.event_type !== 'bounce' && bounceData.event_type !== 'failed') {
      return { processed: false };
    }

    try {
      // Find prospect by email
      const { supabase } = await import('../lib/supabase');
      const { data: prospect } = await supabase
        .from('prospects')
        .select('id, user_id, status')
        .eq('email', bounceData.recipient)
        .single();

      if (prospect) {
        // Update prospect status
        await supabase
          .from('prospects')
          .update({ 
            status: 'bounced',
            updated_at: new Date().toISOString()
          })
          .eq('id', prospect.id);

        // Log to audit_log
        await supabase
          .from('audit_log')
          .insert({
            user_id: prospect.user_id,
            event_type: 'email_bounced',
            entity_type: 'prospect',
            entity_id: prospect.id,
            new_values: {
              reason: bounceData.reason,
              error_code: bounceData.error_code,
              message_id: bounceData.message_id,
            },
          });

        return {
          processed: true,
          prospect_id: prospect.id,
          status_updated: 'bounced',
        };
      }

      return { processed: true };
    } catch (error) {
      console.error('Error handling bounce:', error);
      return { processed: false };
    }
  }

  /**
   * Track email delivery status (alias for getDeliveryStatus)
   * 
   * @param messageId - Message ID
   * @param credentials - SMTP credentials
   * @returns Delivery status
   */
  async trackDelivery(
    messageId: string,
    credentials: SMTPCredentials
  ): Promise<{
    status: 'delivered' | 'bounced' | 'failed' | 'unknown';
    delivered_at?: string;
    bounced_at?: string;
    error?: string;
  }> {
    return this.getDeliveryStatus(messageId, credentials);
  }
}

// Export singleton instance
export const smtpService = new SMTPService('mailgun');

