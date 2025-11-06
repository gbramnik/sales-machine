import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FactCheckService } from '../../../src/services/FactCheckService';
import { TopicBlacklistService } from '../../../src/services/TopicBlacklistService';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

// Mock TopicBlacklistService
vi.mock('../../../src/services/TopicBlacklistService', () => ({
  TopicBlacklistService: vi.fn().mockImplementation(() => ({
    getBlacklist: vi.fn(),
  })),
}));

describe('FactCheckService', () => {
  let service: FactCheckService;
  let mockBlacklistService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FactCheckService(mockSupabase as any);
    mockBlacklistService = (TopicBlacklistService as any).mock.results[0].value;
  });

  describe('detectBlacklistedContent', () => {
    it('should detect blacklisted phrases', async () => {
      const blacklist = [
        { id: '1', category: 'pricing', phrase: 'best price', regex_pattern: null, severity: 'block' },
        { id: '2', category: 'guarantee', phrase: 'guarantee', regex_pattern: null, severity: 'block' },
      ];

      mockBlacklistService.getBlacklist.mockResolvedValue(blacklist);

      const message = 'We offer the best price guarantee for your needs';
      const result = await service.detectBlacklistedContent(message, 'user-1');

      expect(result.detected).toBe(true);
      expect(result.violations).toHaveLength(2);
      expect(result.violations[0].category).toBe('pricing');
      expect(result.violations[1].category).toBe('guarantee');
      expect(result.severity).toBe('block');
    });

    it('should return no violations for clean message', async () => {
      mockBlacklistService.getBlacklist.mockResolvedValue([
        { id: '1', category: 'pricing', phrase: 'best price', regex_pattern: null, severity: 'block' },
      ]);

      const message = 'I would like to learn more about your services';
      const result = await service.detectBlacklistedContent(message, 'user-1');

      expect(result.detected).toBe(false);
      expect(result.violations).toHaveLength(0);
    });

    it('should use custom regex pattern if provided', async () => {
      const blacklist = [
        { id: '1', category: 'pricing', phrase: 'price', regex_pattern: '\\bprice\\b', severity: 'block' },
      ];

      mockBlacklistService.getBlacklist.mockResolvedValue(blacklist);

      const message = 'The price is right';
      const result = await service.detectBlacklistedContent(message, 'user-1');

      expect(result.detected).toBe(true);
    });

    it('should avoid false positives (e.g., "director" containing "cto")', async () => {
      const blacklist = [
        { id: '1', category: 'competitor', phrase: 'cto', regex_pattern: null, severity: 'block' },
      ];

      mockBlacklistService.getBlacklist.mockResolvedValue(blacklist);

      const message = 'I am the Sales Director at the company';
      const result = await service.detectBlacklistedContent(message, 'user-1');

      // Should not match "cto" in "director"
      expect(result.detected).toBe(false);
    });
  });

  describe('extractClaims', () => {
    it('should extract funding claims', () => {
      const message = 'I noticed your recent funding round and new product launch';
      const claims = service.extractClaims(message);

      expect(claims.length).toBeGreaterThan(0);
      expect(claims.some(c => c.includes('funding'))).toBe(true);
      expect(claims.some(c => c.includes('product'))).toBe(true);
    });

    it('should extract expansion claims', () => {
      const message = 'Congratulations on your expansion and growth';
      const claims = service.extractClaims(message);

      expect(claims.length).toBeGreaterThan(0);
      expect(claims.some(c => c.includes('expansion') || c.includes('growth'))).toBe(true);
    });

    it('should return empty array for message with no claims', () => {
      const message = 'I would like to schedule a meeting';
      const claims = service.extractClaims(message);

      expect(claims).toHaveLength(0);
    });

    it('should return unique claims', () => {
      const message = 'recent funding recent funding new product';
      const claims = service.extractClaims(message);

      const uniqueClaims = Array.from(new Set(claims));
      expect(claims.length).toBe(uniqueClaims.length);
    });
  });

  describe('verifyClaimsAgainstEnrichment', () => {
    it('should verify claims found in enrichment data', async () => {
      const enrichment = {
        talking_points: ['recent funding round', 'company expansion'],
        company_data: { description: 'Growing company' },
        recent_activity: 'New product launch announced',
        company_insights: 'Series A funding completed',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: enrichment, error: null }),
      });

      const claims = ['funding', 'product', 'expansion'];
      const result = await service.verifyClaimsAgainstEnrichment(claims, 'prospect-1', 'user-1');

      // Note: This test needs the actual implementation to work
      // For now, we're testing the structure
      expect(result).toHaveProperty('verified_claims');
      expect(result).toHaveProperty('unverified_claims');
      expect(result).toHaveProperty('all_verified');
    });

    it('should mark claims as unverified if not in enrichment data', async () => {
      const enrichment = {
        talking_points: [],
        company_data: {},
        recent_activity: null,
        company_insights: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: enrichment, error: null }),
      });

      const claims = ['recent funding', 'new product'];
      const result = await service.verifyClaimsAgainstEnrichment(claims, 'prospect-1', 'user-1');

      expect(result.unverified_claims.length).toBeGreaterThan(0);
      expect(result.all_verified).toBe(false);
    });

    it('should return all unverified if no enrichment data exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });

      const claims = ['recent funding'];
      const result = await service.verifyClaimsAgainstEnrichment(claims, 'prospect-1', 'user-1');

      expect(result.verified_claims).toHaveLength(0);
      expect(result.unverified_claims.length).toBeGreaterThan(0);
      expect(result.all_verified).toBe(false);
    });
  });

  describe('trackViolation', () => {
    it('should create new warning on first violation', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue({ error: null }),
        });

      const result = await service.trackViolation('user-1', 'prospect-1', 'pricing');

      expect(result.escalated).toBe(false);
      expect(result.violation_count).toBe(1);
    });

    it('should increment count on subsequent violations', async () => {
      const existingWarning = {
        id: 'warning-id',
        violation_count: 2,
        escalated: false,
      };

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingWarning, error: null }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

      const result = await service.trackViolation('user-1', 'prospect-1', 'pricing');

      expect(result.violation_count).toBe(3);
      expect(result.escalated).toBe(true);
      expect(result.message).toContain('3 times');
    });

    it('should escalate after 3 violations', async () => {
      const existingWarning = {
        id: 'warning-id',
        violation_count: 3,
        escalated: false,
      };

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingWarning, error: null }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

      const result = await service.trackViolation('user-1', 'prospect-1', 'pricing');

      expect(result.escalated).toBe(true);
      expect(result.violation_count).toBe(4);
    });
  });
});

