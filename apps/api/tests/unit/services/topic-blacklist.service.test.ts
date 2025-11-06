import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TopicBlacklistService } from '../../../src/services/TopicBlacklistService';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe('TopicBlacklistService', () => {
  let service: TopicBlacklistService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TopicBlacklistService(mockSupabase as any);
  });

  describe('getBlacklist', () => {
    it('should return merged system and user-specific phrases', async () => {
      const systemPhrases = [
        { id: '1', topic_category: 'pricing', blacklisted_phrase: 'best price', regex_pattern: null, severity: 'block' },
        { id: '2', topic_category: 'guarantee', blacklisted_phrase: 'guarantee', regex_pattern: null, severity: 'block' },
      ];
      const userPhrases = [
        { id: '3', topic_category: 'pricing', blacklisted_phrase: 'custom phrase', regex_pattern: null, severity: 'warning' },
      ];

      const systemQuery = {
        select: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      systemQuery.eq.mockResolvedValue({ data: systemPhrases, error: null });

      const userQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      userQuery.eq.mockResolvedValue({ data: userPhrases, error: null });

      mockSupabase.from
        .mockReturnValueOnce(systemQuery)
        .mockReturnValueOnce(userQuery);

      const result = await service.getBlacklist('user-1');

      expect(result).toHaveLength(3);
      expect(result.find(p => p.phrase === 'custom phrase')).toBeDefined();
      expect(result.find(p => p.phrase === 'best price')).toBeDefined();
      expect(result.find(p => p.phrase === 'guarantee')).toBeDefined();
    });

    it('should filter by category when provided', async () => {
      const systemPhrases = [
        { id: '1', topic_category: 'pricing', blacklisted_phrase: 'best price', regex_pattern: null, severity: 'block' },
      ];

      const systemQuery = {
        select: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      systemQuery.eq.mockResolvedValue({ data: systemPhrases, error: null });

      const userQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      userQuery.eq.mockResolvedValue({ data: [], error: null });

      mockSupabase.from
        .mockReturnValueOnce(systemQuery)
        .mockReturnValueOnce(userQuery);

      const result = await service.getBlacklist('user-1', 'pricing');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('pricing');
    });
  });

  describe('addBlacklistPhrase', () => {
    it('should add a user-specific phrase', async () => {
      const newPhrase = {
        id: 'new-id',
        topic_category: 'pricing',
        blacklisted_phrase: 'special discount',
        severity: 'block',
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newPhrase, error: null }),
      });

      const result = await service.addBlacklistPhrase('user-1', 'pricing', 'special discount', 'block');

      expect(result.id).toBe('new-id');
      expect(result.phrase).toBe('special discount');
      expect(result.category).toBe('pricing');
    });

    it('should throw error if phrase already exists', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key' },
        }),
      });

      await expect(
        service.addBlacklistPhrase('user-1', 'pricing', 'best price', 'block')
      ).rejects.toThrow('This phrase is already in your blacklist');
    });
  });

  describe('removeBlacklistPhrase', () => {
    it('should remove a user-specific phrase', async () => {
      const phrase = {
        id: 'phrase-id',
        user_id: 'user-1',
      };

      const fetchQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: phrase, error: null }),
      };

      const deleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn()
          .mockReturnValueOnce({ eq: vi.fn().mockResolvedValue({ error: null }) })
          .mockReturnValueOnce({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(fetchQuery)
        .mockReturnValueOnce(deleteQuery);

      await service.removeBlacklistPhrase('user-1', 'phrase-id');

      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it('should throw error if phrase does not belong to user', async () => {
      const phrase = {
        id: 'phrase-id',
        user_id: 'other-user',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: phrase, error: null }),
      });

      await expect(
        service.removeBlacklistPhrase('user-1', 'phrase-id')
      ).rejects.toThrow('You can only remove your own blacklist phrases');
    });
  });
});

