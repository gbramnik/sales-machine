import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIQualificationService, QualificationContext } from '../../../src/services/ai-qualification.service';
import { ApiError, ErrorCode } from '../../../src/types';

// Mock global fetch
global.fetch = vi.fn();

describe('AIQualificationService', () => {
  let service: AIQualificationService;
  const mockApiKey = 'test-claude-api-key';

  beforeEach(() => {
    service = new AIQualificationService();
    vi.clearAllMocks();
    process.env.CLAUDE_API_KEY = mockApiKey;
    process.env.ANTHROPIC_API_KEY = mockApiKey;
  });

  describe('qualifyProspect', () => {
    const mockContext: QualificationContext = {
      prospect: {
        name: 'John Doe',
        company: 'Acme Corp',
        job_title: 'Software Engineer',
        email: 'john.doe@example.com',
        linkedin_url: 'https://linkedin.com/in/johndoe',
      },
      enrichment: {
        talking_points: ['AI automation', 'B2B SaaS'],
        pain_points: ['Manual processes', 'Scaling challenges'],
        company_insights: 'Fast-growing SaaS company',
        recent_activity: 'Raised Series A funding',
      },
      thread_history: [
        {
          direction: 'inbound',
          channel: 'email',
          message_text: 'I am interested in your solution',
          generated_by_ai: false,
          ai_confidence_score: null,
          sentiment: 'positive',
          created_at: '2025-01-10T10:00:00Z',
        },
      ],
      reply_text: 'Yes, I would like to learn more about your product',
      channel: 'email',
      sentiment: 'positive',
    };

    it('should qualify prospect successfully', async () => {
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

      const result = await service.qualifyProspect(mockContext);

      expect(result).toEqual({
        qualification_status: 'qualified',
        proposed_response_template_id: '00000000-0000-0000-0000-000000000001',
        proposed_channel: 'email',
        confidence_score: 85,
        reasoning: 'Prospect shows clear buying intent',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'x-api-key': mockApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        })
      );
    });

    it('should handle not_qualified status', async () => {
      const mockResponse = {
        id: 'msg-124',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              qualification_status: 'not_qualified',
              proposed_response_template_id: '00000000-0000-0000-0000-000000000002',
              proposed_channel: 'email',
              confidence_score: 90,
              reasoning: 'Prospect not in target market',
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

      const result = await service.qualifyProspect(mockContext);

      expect(result.qualification_status).toBe('not_qualified');
      expect(result.confidence_score).toBe(90);
    });

    it('should handle needs_more_info status', async () => {
      const mockResponse = {
        id: 'msg-125',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              qualification_status: 'needs_more_info',
              proposed_response_template_id: '00000000-0000-0000-0000-000000000003',
              proposed_channel: 'email',
              confidence_score: 65,
              reasoning: 'Need more information about budget and timeline',
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

      const result = await service.qualifyProspect(mockContext);

      expect(result.qualification_status).toBe('needs_more_info');
      expect(result.confidence_score).toBe(65);
    });

    it('should throw error if Claude API key is missing', async () => {
      const originalKey = process.env.CLAUDE_API_KEY;
      const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
      
      delete process.env.CLAUDE_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      await expect(service.qualifyProspect(mockContext)).rejects.toThrow(ApiError);

      // Restore for other tests
      if (originalKey) process.env.CLAUDE_API_KEY = originalKey;
      if (originalAnthropicKey) process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
    });

    it('should throw error if Claude API returns error', async () => {
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: {
            message: 'Invalid API key',
          },
        }),
      });

      await expect(service.qualifyProspect(mockContext)).rejects.toThrow(
        new ApiError(
          ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
          'Claude API error: Invalid API key',
          401
        )
      );
    });

    it('should handle invalid JSON response from Claude', async () => {
      const mockResponse = {
        id: 'msg-126',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Invalid JSON response',
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

      await expect(service.qualifyProspect(mockContext)).rejects.toThrow(ApiError);
    });

    it('should default to same channel if proposed_channel is invalid', async () => {
      const mockResponse = {
        id: 'msg-127',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              qualification_status: 'qualified',
              proposed_response_template_id: '00000000-0000-0000-0000-000000000001',
              proposed_channel: 'invalid_channel',
              confidence_score: 85,
              reasoning: 'Test reasoning',
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

      const result = await service.qualifyProspect(mockContext);

      // Should default to same channel as reply
      expect(result.proposed_channel).toBe('email');
    });

    it('should handle markdown code blocks in response', async () => {
      const mockResponse = {
        id: 'msg-128',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: '```json\n' + JSON.stringify({
              qualification_status: 'qualified',
              proposed_response_template_id: '00000000-0000-0000-0000-000000000001',
              proposed_channel: 'email',
              confidence_score: 85,
              reasoning: 'Test reasoning',
            }) + '\n```',
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

      const result = await service.qualifyProspect(mockContext);

      expect(result.qualification_status).toBe('qualified');
      expect(result.confidence_score).toBe(85);
    });
  });

  describe('calculateSentiment', () => {
    it('should return positive sentiment for positive keywords', () => {
      const positiveText = 'Yes, I am interested in learning more';
      const sentiment = AIQualificationService.calculateSentiment(positiveText);
      expect(sentiment).toBe('positive');
    });

    it('should return negative sentiment for negative keywords', () => {
      const negativeText = 'No thanks, not interested';
      const sentiment = AIQualificationService.calculateSentiment(negativeText);
      expect(sentiment).toBe('negative');
    });

    it('should return neutral sentiment for neutral text', () => {
      const neutralText = 'Thank you for your message';
      const sentiment = AIQualificationService.calculateSentiment(neutralText);
      expect(sentiment).toBe('neutral');
    });

    it('should prioritize negative over positive', () => {
      const mixedText = 'Yes, but no thanks actually';
      const sentiment = AIQualificationService.calculateSentiment(mixedText);
      expect(sentiment).toBe('negative');
    });

    it('should handle empty string', () => {
      const sentiment = AIQualificationService.calculateSentiment('');
      expect(sentiment).toBe('neutral');
    });
  });
});

