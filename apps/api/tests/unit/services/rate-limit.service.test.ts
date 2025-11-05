import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from '../../../../src/services/RateLimitService';

// Mock Upstash Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  })),
}));

describe('RateLimitService', () => {
  let rateLimitService: RateLimitService;
  const userId = 'test-user-id';
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    rateLimitService = new RateLimitService();
  });

  describe('checkScrapingLimit', () => {
    it('should allow request when limit not reached', async () => {
      // Mock Redis to return count below limit
      const mockRedis = await import('@upstash/redis');
      const mockGet = vi.fn().mockResolvedValue('10'); // 10 < 100 (default limit)
      const mockIncr = vi.fn().mockResolvedValue('11');
      const mockExpire = vi.fn().mockResolvedValue('OK');

      // @ts-ignore
      mockRedis.Redis.mockImplementation(() => ({
        get: mockGet,
        incr: mockIncr,
        expire: mockExpire,
      }));

      const result = await rateLimitService.checkScrapingLimit(userId);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should reject request when limit reached', async () => {
      // Mock Redis to return count at limit
      const mockRedis = await import('@upstash/redis');
      const mockGet = vi.fn().mockResolvedValue('100'); // At limit
      const mockIncr = vi.fn().mockResolvedValue('101'); // Exceeds limit
      const mockExpire = vi.fn().mockResolvedValue('OK');

      // @ts-ignore
      mockRedis.Redis.mockImplementation(() => ({
        get: mockGet,
        incr: mockIncr,
        expire: mockExpire,
      }));

      const result = await rateLimitService.checkScrapingLimit(userId);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle Redis not configured (development mode)', async () => {
      // When Redis is not configured, should allow request
      process.env.UPSTASH_REDIS_URL = '';
      process.env.UPSTASH_REDIS_TOKEN = '';

      const result = await rateLimitService.checkScrapingLimit(userId);

      expect(result.allowed).toBe(true);
    });

    it('should set TTL to 24 hours', async () => {
      const mockRedis = await import('@upstash/redis');
      const mockGet = vi.fn().mockResolvedValue('10');
      const mockIncr = vi.fn().mockResolvedValue('11');
      const mockExpire = vi.fn().mockResolvedValue('OK');

      // @ts-ignore
      mockRedis.Redis.mockImplementation(() => ({
        get: mockGet,
        incr: mockIncr,
        expire: mockExpire,
      }));

      await rateLimitService.checkScrapingLimit(userId);

      // Verify expire was called with 24 hours (86400 seconds)
      expect(mockExpire).toHaveBeenCalledWith(
        expect.stringContaining('scraping_limit'),
        86400
      );
    });
  });

  describe('getRemainingLimit', () => {
    it('should return remaining limit correctly', async () => {
      const mockRedis = await import('@upstash/redis');
      const mockGet = vi.fn().mockResolvedValue('50'); // 50 used, 50 remaining

      // @ts-ignore
      mockRedis.Redis.mockImplementation(() => ({
        get: mockGet,
      }));

      const result = await rateLimitService.checkScrapingLimit(userId);

      expect(result.limit).toBe(100); // Default limit
      expect(result.remaining).toBe(50); // 100 - 50
    });
  });
});

