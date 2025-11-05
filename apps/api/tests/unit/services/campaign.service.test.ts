import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignService } from '../../../src/services/CampaignService';
import { RateLimitService } from '../../../src/services/RateLimitService';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock RateLimitService
vi.mock('../../../src/services/RateLimitService', () => ({
  RateLimitService: vi.fn().mockImplementation(() => ({
    checkScrapingLimit: vi.fn(),
  })),
}));

// Mock fetch
global.fetch = vi.fn();

describe('CampaignService - triggerLinkedInScrape', () => {
  let campaignService: CampaignService;
  let mockRateLimitService: any;

  beforeEach(() => {
    campaignService = new CampaignService();
    mockRateLimitService = {
      checkScrapingLimit: vi.fn(),
    };
    (RateLimitService as any).mockImplementation(() => mockRateLimitService);
    vi.clearAllMocks();
  });

  it('should trigger scraping when rate limit allows', async () => {
    const campaignId = 'campaign-id';
    const userId = 'user-id';
    const params = {
      industry: 'Technology',
      location: 'Paris',
    };

    // Mock rate limit check - allowed
    mockRateLimitService.checkScrapingLimit.mockResolvedValue({
      allowed: true,
      remaining: 50,
      limit: 100,
    });

    // Mock campaign exists
    const { supabase } = await import('../../../src/lib/supabase');
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: campaignId, name: 'Test Campaign' },
          }),
        })),
      })),
    });

    // Mock N8N webhook settings
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  webhook_url: 'https://n8n.example.com/webhook/test',
                },
              }),
            })),
          })),
        })),
      })),
    });

    // Mock N8N webhook response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        execution_id: 'exec-123',
      }),
    });

    const result = await campaignService.triggerLinkedInScrape(
      campaignId,
      userId,
      params
    );

    expect(result).toHaveProperty('execution_id');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaignId,
          user_id: userId,
          ...params,
        }),
      })
    );
  });

  it('should throw error when rate limit exceeded', async () => {
    const campaignId = 'campaign-id';
    const userId = 'user-id';

    // Mock rate limit check - not allowed
    mockRateLimitService.checkScrapingLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 100,
    });

    await expect(
      campaignService.triggerLinkedInScrape(campaignId, userId, {})
    ).rejects.toThrow('Daily scraping limit reached');
  });

  it('should throw error when campaign not found', async () => {
    const campaignId = 'campaign-id';
    const userId = 'user-id';

    // Mock rate limit check - allowed
    mockRateLimitService.checkScrapingLimit.mockResolvedValue({
      allowed: true,
      remaining: 50,
    });

    // Mock campaign not found
    const { supabase } = await import('../../../../src/lib/supabase');
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
          }),
        })),
      })),
    });

    await expect(
      campaignService.triggerLinkedInScrape(campaignId, userId, {})
    ).rejects.toThrow('Campaign not found');
  });

  it('should throw error when N8N webhook not configured', async () => {
    const campaignId = 'campaign-id';
    const userId = 'user-id';

    // Mock rate limit check - allowed
    mockRateLimitService.checkScrapingLimit.mockResolvedValue({
      allowed: true,
      remaining: 50,
    });

    // Mock campaign exists
    const { supabase } = await import('../../../src/lib/supabase');
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: campaignId },
          }),
        })),
      })),
    });

    // Mock N8N webhook settings not found
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
              }),
            })),
          })),
        })),
      })),
    });

    await expect(
      campaignService.triggerLinkedInScrape(campaignId, userId, {})
    ).rejects.toThrow('N8N LinkedIn scraping webhook not configured');
  });
});

