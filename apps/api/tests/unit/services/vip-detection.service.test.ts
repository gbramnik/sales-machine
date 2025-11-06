import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VIPDetectionService } from '../../../src/services/VIPDetectionService';
import { supabaseAdmin } from '../../../src/lib/supabase';

// Mock Supabase
vi.mock('../../../../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe('VIPDetectionService', () => {
  let service: VIPDetectionService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
    };
    service = new VIPDetectionService(mockSupabase as any);
  });

  describe('detectVIPFromJobTitle', () => {
    it('should detect CEO as VIP', () => {
      expect(service.detectVIPFromJobTitle('CEO')).toBe(true);
      expect(service.detectVIPFromJobTitle('Chief Executive Officer')).toBe(true);
    });

    it('should detect CTO as VIP', () => {
      expect(service.detectVIPFromJobTitle('CTO')).toBe(true);
      expect(service.detectVIPFromJobTitle('Chief Technology Officer')).toBe(true);
    });

    it('should detect Founder as VIP', () => {
      expect(service.detectVIPFromJobTitle('Founder')).toBe(true);
      expect(service.detectVIPFromJobTitle('Co-Founder')).toBe(true);
    });

    it('should return false for non-C-level titles', () => {
      expect(service.detectVIPFromJobTitle('Software Engineer')).toBe(false);
      expect(service.detectVIPFromJobTitle('Product Manager')).toBe(false);
      // Note: "Director" alone is not a C-level title, only C-level executives are VIP
      expect(service.detectVIPFromJobTitle('Sales Director')).toBe(false);
      expect(service.detectVIPFromJobTitle('Marketing Director')).toBe(false);
      expect(service.detectVIPFromJobTitle('Engineering Manager')).toBe(false);
      expect(service.detectVIPFromJobTitle('VP of Sales')).toBe(false);
      expect(service.detectVIPFromJobTitle('Senior Developer')).toBe(false);
    });

    it('should return false for null or empty titles', () => {
      expect(service.detectVIPFromJobTitle(null)).toBe(false);
      expect(service.detectVIPFromJobTitle('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(service.detectVIPFromJobTitle('ceo')).toBe(true);
      expect(service.detectVIPFromJobTitle('CEO')).toBe(true);
      expect(service.detectVIPFromJobTitle('Ceo')).toBe(true);
    });
  });

  describe('markAsVIP', () => {
    it('should mark prospect as VIP and log to audit', async () => {
      const mockProspect = { id: 'prospect-1', is_vip: true, vip_reason: 'Test reason' };
      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProspect, error: null }),
      };
      const mockInsert = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockUpdate)
        .mockReturnValueOnce(mockInsert);

      const result = await service.markAsVIP('prospect-1', 'user-1', 'Test reason', false);

      expect(result.success).toBe(true);
      expect(result.prospect_id).toBe('prospect-1');
      expect(result.is_vip).toBe(true);
      expect(result.vip_reason).toBe('Test reason');
    });
  });

  describe('unmarkAsVIP', () => {
    it('should unmark prospect as VIP', async () => {
      const mockProspect = { id: 'prospect-1', is_vip: false, vip_reason: null };
      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProspect, error: null }),
      };
      const mockInsert = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockUpdate)
        .mockReturnValueOnce(mockInsert);

      const result = await service.unmarkAsVIP('prospect-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.prospect_id).toBe('prospect-1');
      expect(result.is_vip).toBe(false);
    });
  });
});

