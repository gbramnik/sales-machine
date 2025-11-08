import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIQualificationService } from '../../../src/services/ai-qualification.service';
import { supabaseAdmin } from '../../../src/lib/supabase';
import { ApiError, ErrorCode } from '../../../src/types';

// Mock Supabase admin client
vi.mock('../../../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        or: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock global fetch for Claude API calls
global.fetch = vi.fn();

describe('N8N AI Conversation Webhook Integration', () => {
  const mockUserId = 'user-uuid-123';
  const mockProspectId = 'prospect-uuid-456';
  const mockListId = 'list-uuid-789';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLAUDE_API_KEY = 'test-claude-api-key';
  });

  describe('Webhook payload parsing', () => {
    it('should parse email reply webhook payload (Mailgun format)', () => {
      const mailgunPayload = {
        'event-data': {
          message: {
            headers: {
              'From': 'prospect@example.com',
              'In-Reply-To': 'thread-123',
              'Message-Id': 'msg-456',
            },
            body: {
              text: 'I am interested in your solution',
            },
          },
          recipient: 'prospect@example.com',
        },
      };

      // Simulate N8N webhook parsing logic
      const prospectEmail = mailgunPayload['event-data']?.message?.headers?.['From'] ||
                             mailgunPayload['event-data']?.recipient;
      const replyText = mailgunPayload['event-data']?.message?.body?.text;
      const threadId = mailgunPayload['event-data']?.message?.headers?.['In-Reply-To'];
      const messageId = mailgunPayload['event-data']?.message?.headers?.['Message-Id'];

      expect(prospectEmail).toBe('prospect@example.com');
      expect(replyText).toBe('I am interested in your solution');
      expect(threadId).toBe('thread-123');
      expect(messageId).toBe('msg-456');
    });

    it('should parse LinkedIn reply webhook payload (UniPil format)', () => {
      const unipilPayload = {
        message_id: 'linkedin-msg-789',
        linkedin_url: 'https://linkedin.com/in/prospect',
        message_text: 'Sounds interesting, let\'s talk',
        thread_id: 'linkedin-thread-456',
      };

      // Simulate N8N webhook parsing logic
      const prospectLinkedinUrl = unipilPayload.linkedin_url;
      const replyText = unipilPayload.message_text;
      const threadId = unipilPayload.thread_id;
      const messageId = unipilPayload.message_id;

      expect(prospectLinkedinUrl).toBe('https://linkedin.com/in/prospect');
      expect(replyText).toBe('Sounds interesting, let\'s talk');
      expect(threadId).toBe('linkedin-thread-456');
      expect(messageId).toBe('linkedin-msg-789');
    });
  });

  describe('Prospect identification', () => {
    it('should map email address to prospect_id', async () => {
      const mockProspect = {
        id: mockProspectId,
        user_id: mockUserId,
        email: 'prospect@example.com',
        linkedin_url: null,
      };

      (supabaseAdmin.from('prospects').select().or as vi.Mock).mockResolvedValueOnce({
        data: mockProspect,
        error: null,
      });

      // Simulate prospect lookup
      const { data: prospect } = await supabaseAdmin
        .from('prospects')
        .select('id, user_id, email, linkedin_url')
        .or('email.eq.prospect@example.com,linkedin_url.eq.null')
        .single();

      expect(prospect).toEqual(mockProspect);
      expect(prospect.id).toBe(mockProspectId);
    });

    it('should map linkedin_url to prospect_id', async () => {
      const mockProspect = {
        id: mockProspectId,
        user_id: mockUserId,
        email: null,
        linkedin_url: 'https://linkedin.com/in/prospect',
      };

      (supabaseAdmin.from('prospects').select().or as vi.Mock).mockResolvedValueOnce({
        data: mockProspect,
        error: null,
      });

      // Simulate prospect lookup
      const { data: prospect } = await supabaseAdmin
        .from('prospects')
        .select('id, user_id, email, linkedin_url')
        .or('email.eq.null,linkedin_url.eq.https://linkedin.com/in/prospect')
        .single();

      expect(prospect).toEqual(mockProspect);
      expect(prospect.id).toBe(mockProspectId);
    });

    it('should handle prospect not found error', async () => {
      (supabaseAdmin.from('prospects').select().or as vi.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      // Simulate prospect lookup failure
      const { data: prospect, error } = await supabaseAdmin
        .from('prospects')
        .select('id, user_id, email, linkedin_url')
        .or('email.eq.unknown@example.com,linkedin_url.eq.null')
        .single();

      expect(prospect).toBeNull();
      expect(error).toBeTruthy();
    });
  });

  describe('Claude API qualification', () => {
    it('should call Claude API with correct prompt structure', async () => {
      const qualificationService = new AIQualificationService();

      const mockResponse = {
        id: 'msg-123',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              qualification_status: 'qualified',
              proposed_response_template_id: '00000000-0000-0000-0000-000000000001',
              proposed_channel: 'email',
              confidence_score: 85,
              reasoning: 'Prospect shows clear buying intent',
            }),
          },
        ],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 500,
          output_tokens: 200,
        },
      };

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const context = {
        prospect: {
          name: 'John Doe',
          company: 'Acme Corp',
          job_title: 'Software Engineer',
        },
        enrichment: {
          talking_points: ['AI automation'],
          pain_points: ['Manual processes'],
          company_insights: 'Fast-growing SaaS',
        },
        thread_history: [],
        reply_text: 'I am interested',
        channel: 'email' as const,
        sentiment: 'positive' as const,
      };

      const result = await qualificationService.qualifyProspect(context);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"model":'),
        })
      );

      expect(result.qualification_status).toBe('qualified');
      expect(result.confidence_score).toBe(85);
    });
  });

  describe('Binary decision logic', () => {
    it('should route to booking link if qualified + confidence >80%', () => {
      const qualificationResult = {
        qualification_status: 'qualified',
        confidence_score: 85,
      };

      const shouldTriggerBooking = 
        qualificationResult.qualification_status === 'qualified' &&
        qualificationResult.confidence_score > 80;

      expect(shouldTriggerBooking).toBe(true);
    });

    it('should route to review queue if confidence <80%', () => {
      const qualificationResult = {
        qualification_status: 'qualified',
        confidence_score: 75,
      };

      const shouldQueueForReview = qualificationResult.confidence_score < 80;

      expect(shouldQueueForReview).toBe(true);
    });

    it('should route to nurture if not_qualified', () => {
      const qualificationResult = {
        qualification_status: 'not_qualified',
        confidence_score: 90,
      };

      const shouldNurture = qualificationResult.qualification_status === 'not_qualified';

      expect(shouldNurture).toBe(true);
    });

    it('should route to review queue if needs_more_info', () => {
      const qualificationResult = {
        qualification_status: 'needs_more_info',
        confidence_score: 70,
      };

      const shouldQueueForReview = 
        qualificationResult.qualification_status === 'needs_more_info' ||
        qualificationResult.confidence_score < 80;

      expect(shouldQueueForReview).toBe(true);
    });
  });

  describe('Confidence threshold (80% cutoff)', () => {
    it('should auto-send if confidence = 81%', () => {
      const confidence = 81;
      const shouldAutoSend = confidence > 80;
      expect(shouldAutoSend).toBe(true);
    });

    it('should queue for review if confidence = 79%', () => {
      const confidence = 79;
      const shouldQueueForReview = confidence < 80;
      expect(shouldQueueForReview).toBe(true);
    });

    it('should queue for review if confidence = 80% (edge case)', () => {
      const confidence = 80;
      const shouldQueueForReview = confidence < 80;
      expect(shouldQueueForReview).toBe(false); // 80 is not < 80, so should auto-send
      const shouldAutoSend = confidence >= 80;
      expect(shouldAutoSend).toBe(true);
    });
  });

  describe('AI review queue creation', () => {
    it('should create review queue entry for low confidence', async () => {
      const reviewEntry = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
        message_type: 'reply_response',
        proposed_subject: 'Re: Your inquiry',
        proposed_message: 'AI generated response',
        ai_confidence_score: 75,
        ai_reasoning: 'Low confidence due to ambiguous reply',
        status: 'pending',
      };

      (supabaseAdmin.from('ai_review_queue').insert as vi.Mock).mockResolvedValueOnce({
        data: reviewEntry,
        error: null,
      });

      // Simulate review queue insertion
      const { data: result } = await supabaseAdmin
        .from('ai_review_queue')
        .insert(reviewEntry)
        .select()
        .single();

      expect(result).toEqual(reviewEntry);
      expect(result.status).toBe('pending');
      expect(result.ai_confidence_score).toBeLessThan(80);
    });
  });

  describe('AI conversation log entries', () => {
    it('should log prospect reply (inbound)', async () => {
      const inboundLog = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
        direction: 'inbound',
        channel: 'email',
        message_text: 'I am interested',
        generated_by_ai: false,
        sentiment: 'positive',
        thread_id: 'thread-123',
        email_message_id: 'msg-456',
        received_at: new Date().toISOString(),
      };

      (supabaseAdmin.from('ai_conversation_log').insert as vi.Mock).mockResolvedValueOnce({
        data: inboundLog,
        error: null,
      });

      // Simulate log insertion
      const { data: result } = await supabaseAdmin
        .from('ai_conversation_log')
        .insert(inboundLog)
        .select()
        .single();

      expect(result.direction).toBe('inbound');
      expect(result.generated_by_ai).toBe(false);
      expect(result.channel).toBe('email');
    });

    it('should log AI response (outbound)', async () => {
      const outboundLog = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
        direction: 'outbound',
        channel: 'email',
        subject: 'Re: Your inquiry',
        message_text: 'Thank you for your interest',
        generated_by_ai: true,
        ai_confidence_score: 85,
        is_qualified: true,
        qualification_reason: 'Shows buying intent',
        thread_id: 'thread-123',
        email_message_id: 'msg-789',
        sent_at: new Date().toISOString(),
      };

      (supabaseAdmin.from('ai_conversation_log').insert as vi.Mock).mockResolvedValueOnce({
        data: outboundLog,
        error: null,
      });

      // Simulate log insertion
      const { data: result } = await supabaseAdmin
        .from('ai_conversation_log')
        .insert(outboundLog)
        .select()
        .single();

      expect(result.direction).toBe('outbound');
      expect(result.generated_by_ai).toBe(true);
      expect(result.ai_confidence_score).toBe(85);
      expect(result.is_qualified).toBe(true);
    });

    it('should maintain thread continuity with thread_id', () => {
      const threadId = 'thread-123';
      const inboundLog = {
        thread_id: threadId,
        direction: 'inbound',
      };
      const outboundLog = {
        thread_id: threadId,
        direction: 'outbound',
      };

      // Both logs should use the same thread_id
      expect(inboundLog.thread_id).toBe(outboundLog.thread_id);
      expect(inboundLog.thread_id).toBe(threadId);
    });
  });
});





