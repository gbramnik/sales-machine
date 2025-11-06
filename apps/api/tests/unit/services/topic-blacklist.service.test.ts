import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TopicBlacklistService } from '../../../src/services/TopicBlacklistService';

// Mock Supabase - from() returns a chainable query builder
// The builder is awaitable and resolves with { data, error }
const createQueryBuilder = (finalData?: any, finalError?: any) => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(), // Always returns this for chaining
    single: vi.fn().mockReturnThis(),
  };
  
  // Make the builder itself awaitable (thenable)
  builder.then = vi.fn((resolve: any) => {
    resolve({ data: finalData, error: finalError });
  });
  builder.catch = vi.fn();
  
  // For single() calls, it should resolve
  if (finalData !== undefined || finalError !== undefined) {
    builder.single.mockResolvedValue({ data: finalData, error: finalError });
  }
  
  return builder;
};

const mockSupabase = {
  from: vi.fn(() => createQueryBuilder()),
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

      // Create chainable mock for system query (last eq() resolves)
      const systemQuery = createQueryBuilder(systemPhrases, null);

      // Create chainable mock for user query (last eq() resolves)
      const userQuery = createQueryBuilder(userPhrases, null);

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

      const systemQuery = createQueryBuilder(systemPhrases, null);
      const userQuery = createQueryBuilder([], null);

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

      const insertQuery = createQueryBuilder(newPhrase, null);

      mockSupabase.from.mockReturnValue(insertQuery);

      const result = await service.addBlacklistPhrase('user-1', 'pricing', 'special discount', 'block');

      expect(result.id).toBe('new-id');
      expect(result.phrase).toBe('special discount');
      expect(result.category).toBe('pricing');
    });

    it('should throw error if phrase already exists', async () => {
      const insertQuery = createQueryBuilder(null, { code: '23505', message: 'duplicate key' });
      mockSupabase.from.mockReturnValue(insertQuery);

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

      const fetchQuery = createQueryBuilder(phrase, null);
      const deleteQuery = createQueryBuilder(undefined, null);

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

      const fetchQuery = createQueryBuilder(phrase, null);
      mockSupabase.from.mockReturnValue(fetchQuery);

      await expect(
        service.removeBlacklistPhrase('user-1', 'phrase-id')
      ).rejects.toThrow('You can only remove your own blacklist phrases');
    });
  });
});

