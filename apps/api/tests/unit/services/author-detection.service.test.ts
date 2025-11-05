import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthorDetectionService } from '../../../src/services/AuthorDetectionService';
import { ApiError, ErrorCode } from '../../../src/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabase = () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    insert: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    single: vi.fn(),
  };
  return mockSupabase as unknown as SupabaseClient<any>;
};

describe('AuthorDetectionService', () => {
  let authorDetectionService: AuthorDetectionService;
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  const mockUserId = 'user-123';
  const mockProspectId = 'prospect-123';
  const mockLinkedInUrl = 'https://linkedin.com/in/testuser';

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    authorDetectionService = new AuthorDetectionService(mockSupabase);
    vi.clearAllMocks();
  });

  describe('detectAuthorsProspectCommentsOn', () => {
    it('should return empty array (placeholder - UniPil API endpoint needs confirmation)', async () => {
      const result = await authorDetectionService.detectAuthorsProspectCommentsOn(mockLinkedInUrl);

      // Currently returns empty array as placeholder
      expect(result).toEqual([]);
    });
  });

  describe('storeDetectedAuthors', () => {
    it('should update existing prospect enrichment with detected authors', async () => {
      const authors = [
        {
          author_linkedin_url: 'https://linkedin.com/in/author1',
          author_name: 'Author One',
          post_url: 'https://linkedin.com/posts/author1-post',
        },
        {
          author_linkedin_url: 'https://linkedin.com/in/author2',
          author_name: 'Author Two',
          post_url: 'https://linkedin.com/posts/author2-post',
        },
      ];

      // Mock the query chain for checking existing enrichment
      const mockQueryChain = {
        from: vi.fn(() => mockQueryChain),
        select: vi.fn(() => mockQueryChain),
        eq: vi.fn(() => mockQueryChain),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'enrichment-123',
            company_data: { existing_field: 'value' },
          },
          error: null,
        }),
      };

      // Mock the update chain
      const mockUpdateChain = {
        from: vi.fn(() => mockUpdateChain),
        update: vi.fn(() => mockUpdateChain),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce(mockQueryChain as any) // First call: check existing
        .mockReturnValueOnce(mockUpdateChain as any); // Second call: update

      await expect(
        authorDetectionService.storeDetectedAuthors(mockProspectId, mockUserId, authors)
      ).resolves.not.toThrow();
    });

    it('should create new enrichment entry if not exists', async () => {
      const authors = [
        {
          author_linkedin_url: 'https://linkedin.com/in/author1',
          author_name: 'Author One',
          post_url: 'https://linkedin.com/posts/author1-post',
        },
      ];

      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      
      // First call: check existing enrichment (not found)
      vi.mocked(mockSupabase.single).mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      } as any);

      // Second call: insert new enrichment
      vi.mocked(mockSupabase.insert).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      await expect(
        authorDetectionService.storeDetectedAuthors(mockProspectId, mockUserId, authors)
      ).resolves.not.toThrow();
    });

    it('should throw ApiError on database error', async () => {
      const authors = [
        {
          author_linkedin_url: 'https://linkedin.com/in/author1',
          author_name: 'Author One',
          post_url: 'https://linkedin.com/posts/author1-post',
        },
      ];

      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: { id: 'enrichment-123', company_data: {} },
        error: null,
      } as any);

      vi.mocked(mockSupabase.update).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.update).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as any);

      await expect(
        authorDetectionService.storeDetectedAuthors(mockProspectId, mockUserId, authors)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getDetectedAuthors', () => {
    it('should return detected authors from enrichment', async () => {
      const authors = [
        {
          author_linkedin_url: 'https://linkedin.com/in/author1',
          author_name: 'Author One',
          post_url: 'https://linkedin.com/posts/author1-post',
        },
      ];

      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          company_data: {
            detected_authors: authors,
          },
        },
        error: null,
      } as any);

      const result = await authorDetectionService.getDetectedAuthors(mockProspectId, mockUserId);

      expect(result).toEqual(authors);
    });

    it('should return empty array when no enrichment found', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      } as any);

      const result = await authorDetectionService.getDetectedAuthors(mockProspectId, mockUserId);

      expect(result).toEqual([]);
    });

    it('should return empty array when no detected_authors field', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          company_data: {},
        },
        error: null,
      } as any);

      const result = await authorDetectionService.getDetectedAuthors(mockProspectId, mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getRandomAuthorForEngagement', () => {
    it('should return random author from detected authors', async () => {
      const authors = [
        {
          author_linkedin_url: 'https://linkedin.com/in/author1',
          author_name: 'Author One',
          post_url: 'https://linkedin.com/posts/author1-post',
        },
        {
          author_linkedin_url: 'https://linkedin.com/in/author2',
          author_name: 'Author Two',
          post_url: 'https://linkedin.com/posts/author2-post',
        },
      ];

      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          company_data: {
            detected_authors: authors,
          },
        },
        error: null,
      } as any);

      const result = await authorDetectionService.getRandomAuthorForEngagement(
        mockProspectId,
        mockUserId
      );

      expect(result).not.toBeNull();
      expect(authors).toContainEqual(result);
    });

    it('should return null when no authors found', async () => {
      vi.mocked(mockSupabase.from).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.select).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.eq).mockReturnValue(mockSupabase);
      vi.mocked(mockSupabase.single).mockResolvedValue({
        data: {
          company_data: {},
        },
        error: null,
      } as any);

      const result = await authorDetectionService.getRandomAuthorForEngagement(
        mockProspectId,
        mockUserId
      );

      expect(result).toBeNull();
    });
  });

  describe('hasProspectPosts', () => {
    it('should return false (placeholder - UniPil API endpoint needs confirmation)', async () => {
      const result = await authorDetectionService.hasProspectPosts(mockLinkedInUrl);

      // Currently returns false as placeholder
      expect(result).toBe(false);
    });
  });
});

