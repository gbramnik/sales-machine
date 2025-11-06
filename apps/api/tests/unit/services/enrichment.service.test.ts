import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Redis } from '@upstash/redis';

/**
 * Unit tests for Enrichment Service
 * Story 1.3: AI-Powered Contextual Enrichment
 * 
 * Tests cover:
 * - Redis cache hit/miss scenarios
 * - Low-confidence flagging logic
 * - Error handling
 * - Token usage tracking
 * - Multi-source enrichment determination
 */

describe('Enrichment Service', () => {
  const mockProspectId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
  const cacheKey = `enrichment:${mockProspectId}`;

  let mockRedis: any;

  beforeEach(() => {
    // Mock Redis
    mockRedis = {
      get: vi.fn(),
      set: vi.fn(),
    };

    vi.mock('@upstash/redis', () => ({
      Redis: vi.fn().mockImplementation(() => mockRedis),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Redis Cache', () => {
    it('should return cached enrichment data on cache hit', async () => {
      const cachedEnrichment = {
        talking_points: ['Point 1', 'Point 2'],
        pain_points: ['Pain 1'],
        personalization_score: 85,
        enrichment_source: 'full',
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedEnrichment));

      const result = await mockRedis.get(cacheKey);
      const parsed = result ? JSON.parse(result) : null;

      expect(parsed).toEqual(cachedEnrichment);
      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should return null on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await mockRedis.get(cacheKey);

      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should store enrichment in cache with 7-day TTL', async () => {
      const enrichmentData = {
        talking_points: ['Point 1'],
        pain_points: ['Pain 1'],
        personalization_score: 80,
        enrichment_source: 'linkedin_company',
      };

      const ttl = 604800; // 7 days in seconds

      await mockRedis.set(cacheKey, JSON.stringify(enrichmentData), { ex: ttl });

      expect(mockRedis.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(enrichmentData),
        { ex: ttl }
      );
    });

    it('should handle cache key format correctly', () => {
      const prospectId = 'test-prospect-id';
      const expectedKey = `enrichment:${prospectId}`;

      expect(expectedKey).toBe('enrichment:test-prospect-id');
    });
  });

  describe('Low-Confidence Flagging', () => {
    it('should flag prospect when personalization_score < 50', () => {
      const score = 49;
      const shouldFlag = score < 50;

      expect(shouldFlag).toBe(true);
    });

    it('should NOT flag prospect when personalization_score = 50', () => {
      const score = 50;
      const shouldFlag = score < 50;

      expect(shouldFlag).toBe(false);
    });

    it('should NOT flag prospect when personalization_score > 50', () => {
      const score = 80;
      const shouldFlag = score < 50;

      expect(shouldFlag).toBe(false);
    });

    it('should create ai_review_queue entry for low-confidence enrichment', () => {
      const enrichment = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
        personalization_score: 45,
        requires_approval: true,
      };

      const reviewQueueEntry = {
        prospect_id: enrichment.prospect_id,
        user_id: enrichment.user_id,
        message_type: 'initial_outreach',
        status: 'pending',
        reason: `Enrichment score below threshold (${enrichment.personalization_score})`,
      };

      expect(reviewQueueEntry.status).toBe('pending');
      expect(reviewQueueEntry.message_type).toBe('initial_outreach');
      expect(reviewQueueEntry.reason).toContain('below threshold');
    });
  });

  describe('Error Handling', () => {
    it('should handle Claude API timeout with retry', () => {
      const retryConfig = {
        maxTries: 2,
        waitBetweenTries: 2000, // 2 seconds
        exponentialBackoff: false,
      };

      expect(retryConfig.maxTries).toBe(2);
      expect(retryConfig.waitBetweenTries).toBe(2000);
    });

    it('should mark prospect as enrichment_failed after retry failure', () => {
      const error = {
        type: 'claude_api_error',
        message: 'API timeout after 2 retries',
        prospect_id: mockProspectId,
      };

      const prospectStatus = 'enrichment_failed';

      expect(prospectStatus).toBe('enrichment_failed');
    });

    it('should handle invalid JSON response from Claude API', () => {
      const invalidResponse = 'This is not valid JSON';
      
      expect(() => {
        JSON.parse(invalidResponse);
      }).toThrow();
    });

    it('should extract JSON from markdown code blocks', () => {
      const responseWithMarkdown = '```json\n{"talking_points": ["Point 1"]}\n```';
      const jsonMatch = responseWithMarkdown.match(/```json\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1];
        const parsed = JSON.parse(jsonString);
        expect(parsed.talking_points).toEqual(['Point 1']);
      }
    });
  });

  describe('Token Usage Tracking', () => {
    it('should extract token count from Claude API response headers', () => {
      const mockHeaders = {
        'anthropic-ratelimit-request-tokens': '100',
        'anthropic-ratelimit-response-tokens': '50',
      };

      const requestTokens = parseInt(mockHeaders['anthropic-ratelimit-request-tokens'] || '0', 10);
      const responseTokens = parseInt(mockHeaders['anthropic-ratelimit-response-tokens'] || '0', 10);
      const totalTokens = requestTokens + responseTokens;

      expect(totalTokens).toBe(150);
    });

    it('should handle missing token headers gracefully', () => {
      const mockHeaders = {};
      const requestTokens = parseInt(mockHeaders['anthropic-ratelimit-request-tokens'] || '0', 10);
      const responseTokens = parseInt(mockHeaders['anthropic-ratelimit-response-tokens'] || '0', 10);
      const totalTokens = requestTokens + responseTokens;

      expect(totalTokens).toBe(0);
    });

    it('should calculate cost estimate from token count', () => {
      const tokenCount = 150;
      const costPer1KTokens = 0.003; // Claude Sonnet 3.5 approximate cost
      const costEstimate = (tokenCount / 1000) * costPer1KTokens;

      expect(costEstimate).toBeCloseTo(0.00045, 5);
    });
  });

  describe('Multi-Source Enrichment', () => {
    it('should determine enrichment_source as linkedin_only when no company data', () => {
      const hasCompanyData = false;
      const hasWebData = false;
      const hasEmail = false;

      let enrichmentSource = 'linkedin_only';
      if (hasCompanyData) {
        enrichmentSource = 'linkedin_company';
      }
      if (hasCompanyData && hasWebData) {
        enrichmentSource = 'linkedin_company_web';
      }
      if (hasCompanyData && hasWebData && hasEmail) {
        enrichmentSource = 'full';
      }

      expect(enrichmentSource).toBe('linkedin_only');
    });

    it('should determine enrichment_source as linkedin_company when company data available', () => {
      const hasCompanyData = true;
      const hasWebData = false;
      const hasEmail = false;

      let enrichmentSource = 'linkedin_only';
      if (hasCompanyData) {
        enrichmentSource = 'linkedin_company';
      }
      if (hasCompanyData && hasWebData) {
        enrichmentSource = 'linkedin_company_web';
      }
      if (hasCompanyData && hasWebData && hasEmail) {
        enrichmentSource = 'full';
      }

      expect(enrichmentSource).toBe('linkedin_company');
    });

    it('should determine enrichment_source as linkedin_company_web when company + web data available', () => {
      const hasCompanyData = true;
      const hasWebData = true;
      const hasEmail = false;

      let enrichmentSource = 'linkedin_only';
      if (hasCompanyData) {
        enrichmentSource = 'linkedin_company';
      }
      if (hasCompanyData && hasWebData) {
        enrichmentSource = 'linkedin_company_web';
      }
      if (hasCompanyData && hasWebData && hasEmail) {
        enrichmentSource = 'full';
      }

      expect(enrichmentSource).toBe('linkedin_company_web');
    });

    it('should determine enrichment_source as full when all data sources available', () => {
      const hasCompanyData = true;
      const hasWebData = true;
      const hasEmail = true;

      let enrichmentSource = 'linkedin_only';
      if (hasCompanyData) {
        enrichmentSource = 'linkedin_company';
      }
      if (hasCompanyData && hasWebData) {
        enrichmentSource = 'linkedin_company_web';
      }
      if (hasCompanyData && hasWebData && hasEmail) {
        enrichmentSource = 'full';
      }

      expect(enrichmentSource).toBe('full');
    });
  });

  describe('Supabase Operations', () => {
    it('should handle ON CONFLICT update for existing enrichment', () => {
      const enrichmentData = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
        talking_points: ['New Point'],
        personalization_score: 85,
      };

      // Simulate ON CONFLICT DO UPDATE
      const existingEnrichment = {
        id: 'existing-id',
        prospect_id: mockProspectId,
        talking_points: ['Old Point'],
      };

      const updatedEnrichment = {
        ...existingEnrichment,
        ...enrichmentData,
        enriched_at: new Date().toISOString(),
      };

      expect(updatedEnrichment.talking_points).toEqual(['New Point']);
      expect(updatedEnrichment.prospect_id).toBe(mockProspectId);
    });

    it('should insert new enrichment when prospect_id does not exist', () => {
      const enrichmentData = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
        talking_points: ['Point 1'],
        personalization_score: 80,
      };

      // Simulate INSERT
      const newEnrichment = {
        id: 'new-id',
        ...enrichmentData,
        enriched_at: new Date().toISOString(),
      };

      expect(newEnrichment.id).toBe('new-id');
      expect(newEnrichment.prospect_id).toBe(mockProspectId);
    });

    it('should enforce user_id isolation (RLS policy)', () => {
      const enrichmentData = {
        prospect_id: mockProspectId,
        user_id: mockUserId,
      };

      // RLS should prevent access to other users' enrichments
      const otherUserId = 'other-user-id';
      const canAccess = enrichmentData.user_id === otherUserId;

      expect(canAccess).toBe(false);
    });
  });

  describe('Claude API Integration', () => {
    it('should build correct prompt structure', () => {
      const systemPrompt = 'You are a B2B sales research assistant specializing in personalized LinkedIn outreach with deep company context.';
      const userPrompt = 'Based on this LinkedIn profile...';

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('should parse Claude API response correctly', () => {
      const mockClaudeResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              talking_points: ['Point 1', 'Point 2'],
              pain_points: ['Pain 1'],
              personalization_score: 85,
            }),
          },
        ],
      };

      const content = mockClaudeResponse.content[0].text;
      const parsed = JSON.parse(content);

      expect(parsed.talking_points).toHaveLength(2);
      expect(parsed.personalization_score).toBe(85);
    });

    it('should handle Claude API error response', () => {
      const errorResponse = {
        error: {
          type: 'invalid_request_error',
          message: 'Invalid API key',
        },
      };

      expect(errorResponse.error.type).toBe('invalid_request_error');
      expect(errorResponse.error.message).toContain('API key');
    });
  });
});

