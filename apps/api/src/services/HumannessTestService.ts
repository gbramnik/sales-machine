import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';
import { SMTPService } from './SMTPService';

type HumannessTest = Database['public']['Tables']['humanness_tests']['Row'];
type HumannessTestInsert = Database['public']['Tables']['humanness_tests']['Insert'];
type Panelist = Database['public']['Tables']['humanness_test_panelists']['Row'];
type PanelistInsert = Database['public']['Tables']['humanness_test_panelists']['Insert'];

export interface PanelistData {
  full_name: string;
  email: string;
  job_title?: string;
  company_name?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  industry?: string;
  country?: string;
  role?: 'owner' | 'founder' | 'ceo' | 'cto' | 'cmo' | 'decision_maker';
  compensation_offered?: string;
}

export interface BulkInviteResult {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ panelist_id: string; error: string }>;
}

export class HumannessTestService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private smtpService: SMTPService = new SMTPService('mailgun')
  ) {}

  /**
   * Create a new humanness test
   */
  async createTest(
    testName: string,
    testVersion: string,
    userId: string
  ): Promise<HumannessTest> {
    const testData: HumannessTestInsert = {
      test_name: testName,
      test_version: testVersion,
      test_type: 'perception_panel',
      status: 'draft',
      target_detection_rate: 20.00,
      created_by: userId,
      metadata: {},
    };

    const { data, error } = await this.supabase
      .from('humanness_tests')
      .insert(testData)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to create humanness test',
        500,
        error
      );
    }

    return data;
  }

  /**
   * Add a panelist to a test
   */
  async addPanelist(testId: string, panelistData: PanelistData): Promise<Panelist> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(panelistData.email)) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid email format',
        400
      );
    }

    // Verify test exists and belongs to user
    const { data: test } = await this.supabase
      .from('humanness_tests')
      .select('id, created_by')
      .eq('id', testId)
      .single();

    if (!test) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Test not found',
        404
      );
    }

    const panelistInsert: PanelistInsert = {
      test_id: testId,
      full_name: panelistData.full_name,
      email: panelistData.email,
      job_title: panelistData.job_title || null,
      company_name: panelistData.company_name || null,
      company_size: panelistData.company_size || null,
      industry: panelistData.industry || null,
      country: panelistData.country || 'FR',
      role: panelistData.role || null,
      recruitment_status: 'pending',
      compensation_offered: panelistData.compensation_offered || null,
    };

    const { data, error } = await this.supabase
      .from('humanness_test_panelists')
      .insert(panelistInsert)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'Panelist with this email already exists for this test',
          400
        );
      }
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to add panelist',
        500,
        error
      );
    }

    return data;
  }

  /**
   * Send invitation email to a panelist
   */
  async sendPanelistInvitation(testId: string, panelistId: string): Promise<void> {
    // Get panelist and test details
    const { data: panelist, error: panelistError } = await this.supabase
      .from('humanness_test_panelists')
      .select('*, test:humanness_tests!inner(id, test_name, created_by)')
      .eq('id', panelistId)
      .eq('test_id', testId)
      .single();

    if (panelistError || !panelist) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Panelist not found',
        404
      );
    }

    const test = panelist.test as any;
    const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3000';
    const testLink = `${webAppUrl}/humanness-test/${testId}/panelist/${panelistId}`;

    // Generate invitation email
    const subject = 'Invitation to participate in AI message perception study';
    const emailBody = `
      <html>
        <body>
          <h2>Hello ${panelist.full_name},</h2>
          <p>You have been invited to participate in an AI message perception study.</p>
          <p><strong>Test:</strong> ${test.test_name}</p>
          <p><strong>What you'll do:</strong> You will review 10 messages and indicate whether you think each was written by AI or a human.</p>
          <p><strong>Estimated time:</strong> 5-10 minutes</p>
          ${panelist.compensation_offered ? `<p><strong>Compensation:</strong> ${panelist.compensation_offered}</p>` : ''}
          <p><a href="${testLink}">Click here to start the test</a></p>
          <p>Thank you for your participation!</p>
        </body>
      </html>
    `;

    // Send email via SMTP
    try {
      await this.smtpService.sendEmail(
        {
          to: panelist.email,
          subject,
          html: emailBody,
          from: process.env.SMTP_FROM_EMAIL || 'research@no-spray-no-pray.com',
        },
        {
          api_key: process.env.MAILGUN_API_KEY || '',
          domain: process.env.MAILGUN_DOMAIN || '',
          from_email: process.env.SMTP_FROM_EMAIL || 'research@no-spray-no-pray.com',
        }
      );
    } catch (error) {
      throw new ApiError(
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        'Failed to send invitation email',
        500,
        error instanceof Error ? error : undefined
      );
    }

    // Update panelist status
    const { error: updateError } = await this.supabase
      .from('humanness_test_panelists')
      .update({
        recruitment_status: 'invited',
        invitation_sent_at: new Date().toISOString(),
      })
      .eq('id', panelistId);

    if (updateError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to update panelist status',
        500,
        updateError
      );
    }
  }

  /**
   * Send invitations to multiple panelists
   */
  async bulkInvitePanelists(
    testId: string,
    panelistIds: string[]
  ): Promise<BulkInviteResult> {
    const result: BulkInviteResult = {
      total: panelistIds.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const panelistId of panelistIds) {
      try {
        await this.sendPanelistInvitation(testId, panelistId);
        result.sent++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          panelist_id: panelistId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Get test by ID
   */
  async getTest(testId: string, userId: string): Promise<HumannessTest> {
    const { data, error } = await this.supabase
      .from('humanness_tests')
      .select('*')
      .eq('id', testId)
      .eq('created_by', userId)
      .single();

    if (error || !data) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Test not found',
        404
      );
    }

    return data;
  }

  /**
   * Get panelists for a test
   */
  async getPanelists(testId: string): Promise<Panelist[]> {
    const { data, error } = await this.supabase
      .from('humanness_test_panelists')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch panelists',
        500,
        error
      );
    }

    return data || [];
  }
}

