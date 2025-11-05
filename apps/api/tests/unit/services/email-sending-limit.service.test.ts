import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailSendingLimitService } from '../../../../src/services/email-sending-limit.service';

// Mock Redis
vi.mock('@upstash/redis', () => {
  const mockRedis = {
    get: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  };

  return {
    Redis: vi.fn(() => mockRedis),
  };
});

describe('EmailSendingLimitService', () => {
  let emailSendingLimitService: EmailSendingLimitService;
  const mockUserId = 'user-123';
  const mockSendingEmail = 'test@example.com';

  beforeEach(() => {
    emailSendingLimitService = new EmailSendingLimitService();
    vi.clearAllMocks();
  });

  describe('isLimitReached', () => {
    it('should return false when limit not reached', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.get).mockResolvedValue(10);

      const isReached = await emailSendingLimitService.isLimitReached(
        mockUserId,
        mockSendingEmail
      );

      expect(isReached).toBe(false);
    });

    it('should return true when limit reached', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.get).mockResolvedValue(20);

      const isReached = await emailSendingLimitService.isLimitReached(
        mockUserId,
        mockSendingEmail
      );

      expect(isReached).toBe(true);
    });
  });

  describe('incrementCount', () => {
    it('should increment count and set TTL', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.incr).mockResolvedValue(11);
      vi.mocked(redis.expire).mockResolvedValue(1);

      const newCount = await emailSendingLimitService.incrementCount(
        mockUserId,
        mockSendingEmail
      );

      expect(newCount).toBe(11);
      expect(redis.expire).toHaveBeenCalledWith(expect.any(String), 86400);
    });
  });

  describe('validateLimit', () => {
    it('should not throw when limit not reached', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.get).mockResolvedValue(10);

      await expect(
        emailSendingLimitService.validateLimit(mockUserId, mockSendingEmail)
      ).resolves.not.toThrow();
    });

    it('should throw when limit reached', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.get).mockResolvedValue(20);

      await expect(
        emailSendingLimitService.validateLimit(mockUserId, mockSendingEmail)
      ).rejects.toThrow('Daily sending limit reached');
    });
  });
});

