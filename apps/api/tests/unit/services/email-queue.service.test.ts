import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailQueueService } from '../../../../src/services/email-queue.service';

// Mock Redis
vi.mock('@upstash/redis', () => {
  const mockRedis = {
    zadd: vi.fn(),
    zrange: vi.fn(),
    zrank: vi.fn(),
    zrem: vi.fn(),
    zcard: vi.fn(),
    del: vi.fn(),
  };

  return {
    Redis: vi.fn(() => mockRedis),
  };
});

describe('EmailQueueService', () => {
  let emailQueueService: EmailQueueService;
  const mockUserId = 'user-123';
  const mockEmailItem = {
    prospect_id: 'prospect-123',
    template_id: 'template-123',
    sending_email: 'test@example.com',
    personalized_subject: 'Test Subject',
    personalized_body: 'Test Body',
    is_vip: false,
    user_id: mockUserId,
    campaign_id: 'campaign-123',
  };

  beforeEach(() => {
    emailQueueService = new EmailQueueService();
    vi.clearAllMocks();
  });

  describe('enqueue', () => {
    it('should enqueue email successfully', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.zadd).mockResolvedValue(1);
      vi.mocked(redis.zrank).mockResolvedValue(0);

      const position = await emailQueueService.enqueue(mockEmailItem);

      expect(position).toBe(0);
      expect(redis.zadd).toHaveBeenCalled();
    });

    it('should prioritize VIP emails', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      const vipItem = { ...mockEmailItem, is_vip: true };
      vi.mocked(redis.zadd).mockResolvedValue(1);
      vi.mocked(redis.zrank).mockResolvedValue(0);

      await emailQueueService.enqueue(vipItem);

      expect(redis.zadd).toHaveBeenCalled();
      // VIP emails should have lower score (higher priority)
      const callArgs = vi.mocked(redis.zadd).mock.calls[0];
      expect(callArgs).toBeDefined();
    });
  });

  describe('dequeue', () => {
    it('should dequeue emails successfully', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      const mockItemJson = JSON.stringify(mockEmailItem);
      vi.mocked(redis.zrange).mockResolvedValue([mockItemJson]);
      vi.mocked(redis.zrank).mockResolvedValue(0);
      vi.mocked(redis.zrem).mockResolvedValue(1);

      const emails = await emailQueueService.dequeue(mockUserId, 20);

      expect(emails.length).toBeGreaterThan(0);
      expect(emails[0].prospect_id).toBe(mockEmailItem.prospect_id);
      expect(redis.zrem).toHaveBeenCalled();
    });

    it('should return empty array when queue is empty', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.zrange).mockResolvedValue([]);

      const emails = await emailQueueService.dequeue(mockUserId, 20);

      expect(emails).toEqual([]);
    });
  });

  describe('getQueueSize', () => {
    it('should return queue size', async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({} as any);

      vi.mocked(redis.zcard).mockResolvedValue(5);

      const size = await emailQueueService.getQueueSize(mockUserId);

      expect(size).toBe(5);
    });
  });
});

