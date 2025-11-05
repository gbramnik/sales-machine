import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emailTemplateService } from '../../../src/services/email-template.service';
import { supabaseAdmin } from '../../../src/lib/supabase';
import { ApiError, ErrorCode } from '../../../src/types';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe('EmailTemplateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('personalizeTemplate', () => {
    it('should personalize email template with valid enrichment data', async () => {
      const mockTemplate = {
        id: 'template-1',
        user_id: null,
        name: 'Cold Intro',
        description: 'Test template',
        use_case: 'cold_intro',
        subject_line: 'Quick question about {{company}}',
        body: 'Hi {{prospect_name}}, I noticed {{talking_point_1}}.',
        channel: 'email',
        linkedin_message_preview: null,
        variables_required: ['prospect_name', 'company', 'talking_point_1'],
        tone: 'conversational',
        variant_id: null,
        is_active: true,
        is_system_template: true,
      };

      const mockProspect = {
        id: 'prospect-1',
        name: 'John Doe',
        job_title: 'CEO',
        company: 'Acme Corp',
        list_id: 'list-1',
      };

      const mockList = {
        id: 'list-1',
        user_id: 'user-1',
      };

      const mockEnrichment = {
        talking_points: ['Great company culture', 'Growing team'],
        pain_points: ['Manual processes', 'Time constraints'],
        recent_activity: 'Recently raised Series A',
        company_insights: 'Fast-growing SaaS company',
        tech_stack: ['React', 'Node.js'],
      };

      // Mock template fetch
      const mockTemplateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTemplate, error: null }),
      };

      // Mock prospect fetch
      const mockProspectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: mockProspect, error: null })
          .mockResolvedValueOnce({ data: mockList, error: null }),
      };

      // Mock enrichment fetch
      const mockEnrichmentQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEnrichment, error: null }),
      };

      (supabaseAdmin.from as any)
        .mockReturnValueOnce(mockTemplateQuery)
        .mockReturnValueOnce(mockProspectQuery)
        .mockReturnValueOnce(mockProspectQuery)
        .mockReturnValueOnce(mockEnrichmentQuery);

      const result = await emailTemplateService.personalizeTemplate(
        'template-1',
        'prospect-1',
        'user-1'
      );

      expect(result.subject).toBe('Quick question about Acme Corp');
      expect(result.body).toBe('Hi John Doe, I noticed Great company culture.');
      expect(result.variables_used).toContain('prospect_name');
      expect(result.variables_used).toContain('company');
      expect(result.variables_used).toContain('talking_point_1');
      expect(result.variables_missing).toHaveLength(0);
    });

    it('should personalize LinkedIn template without subject line', async () => {
      const mockTemplate = {
        id: 'template-2',
        user_id: null,
        name: 'LinkedIn Cold Connection',
        description: 'LinkedIn template',
        use_case: 'cold_intro',
        subject_line: null,
        body: 'Hi {{prospect_name}}, I noticed {{talking_point_1}}.',
        channel: 'linkedin',
        linkedin_message_preview: 'Would love to connect! {{talking_point_1}}',
        variables_required: ['prospect_name', 'talking_point_1'],
        tone: 'conversational',
        variant_id: null,
        is_active: true,
        is_system_template: true,
      };

      const mockProspect = {
        id: 'prospect-1',
        name: 'John Doe',
        job_title: 'CEO',
        company: 'Acme Corp',
        list_id: 'list-1',
      };

      const mockList = {
        id: 'list-1',
        user_id: 'user-1',
      };

      const mockEnrichment = {
        talking_points: ['Great company culture'],
        pain_points: [],
        recent_activity: null,
        company_insights: null,
        tech_stack: [],
      };

      const mockTemplateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTemplate, error: null }),
      };

      const mockProspectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: mockProspect, error: null })
          .mockResolvedValueOnce({ data: mockList, error: null }),
      };

      const mockEnrichmentQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEnrichment, error: null }),
      };

      (supabaseAdmin.from as any)
        .mockReturnValueOnce(mockTemplateQuery)
        .mockReturnValueOnce(mockProspectQuery)
        .mockReturnValueOnce(mockProspectQuery)
        .mockReturnValueOnce(mockEnrichmentQuery);

      const result = await emailTemplateService.personalizeTemplate(
        'template-2',
        'prospect-1',
        'user-1'
      );

      expect(result.subject).toBeUndefined();
      expect(result.body).toBe('Hi John Doe, I noticed Great company culture.');
      expect(result.linkedin_preview).toBe('Would love to connect! Great company culture');
    });

    it('should throw error if template not found', async () => {
      const mockTemplateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      (supabaseAdmin.from as any).mockReturnValueOnce(mockTemplateQuery);

      await expect(
        emailTemplateService.personalizeTemplate('invalid-id', 'prospect-1', 'user-1')
      ).rejects.toThrow(ApiError);
    });

    it('should identify missing required variables', async () => {
      const mockTemplate = {
        id: 'template-1',
        user_id: null,
        name: 'Cold Intro',
        description: 'Test template',
        use_case: 'cold_intro',
        subject_line: 'Quick question about {{company}}',
        body: 'Hi {{prospect_name}}, I noticed {{talking_point_1}}.',
        channel: 'email',
        linkedin_message_preview: null,
        variables_required: ['prospect_name', 'company', 'talking_point_1', 'pain_point_1'],
        tone: 'conversational',
        variant_id: null,
        is_active: true,
        is_system_template: true,
      };

      const mockProspect = {
        id: 'prospect-1',
        name: 'John Doe',
        job_title: 'CEO',
        company: 'Acme Corp',
        list_id: 'list-1',
      };

      const mockList = {
        id: 'list-1',
        user_id: 'user-1',
      };

      const mockEnrichment = {
        talking_points: ['Great company culture'],
        pain_points: [], // Empty pain points - pain_point_1 will be missing
        recent_activity: null,
        company_insights: null,
        tech_stack: [],
      };

      const mockTemplateQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTemplate, error: null }),
      };

      const mockProspectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: mockProspect, error: null })
          .mockResolvedValueOnce({ data: mockList, error: null }),
      };

      const mockEnrichmentQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEnrichment, error: null }),
      };

      (supabaseAdmin.from as any)
        .mockReturnValueOnce(mockTemplateQuery)
        .mockReturnValueOnce(mockProspectQuery)
        .mockReturnValueOnce(mockProspectQuery)
        .mockReturnValueOnce(mockEnrichmentQuery);

      const result = await emailTemplateService.personalizeTemplate(
        'template-1',
        'prospect-1',
        'user-1'
      );

      expect(result.variables_missing).toContain('pain_point_1');
      expect(result.variables_used).toContain('prospect_name');
      expect(result.variables_used).toContain('company');
      expect(result.variables_used).toContain('talking_point_1');
    });
  });

  describe('validateTemplateVariables', () => {
    it('should return valid=true when all required variables are present', () => {
      const template = {
        id: 'template-1',
        variables_required: ['prospect_name', 'company', 'talking_point_1'],
      } as any;

      const prospect = {
        id: 'prospect-1',
        name: 'John Doe',
        company: 'Acme Corp',
      } as any;

      const enrichment = {
        talking_points: ['Great company'],
        pain_points: [],
        recent_activity: null,
        company_insights: null,
        tech_stack: [],
      } as any;

      const result = emailTemplateService.validateTemplateVariables(
        template,
        enrichment,
        prospect
      );

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return valid=false when required variables are missing', () => {
      const template = {
        id: 'template-1',
        variables_required: ['prospect_name', 'company', 'talking_point_1', 'pain_point_1'],
      } as any;

      const prospect = {
        id: 'prospect-1',
        name: 'John Doe',
        company: 'Acme Corp',
      } as any;

      const enrichment = {
        talking_points: ['Great company'],
        pain_points: [], // Missing pain_point_1
        recent_activity: null,
        company_insights: null,
        tech_stack: [],
      } as any;

      const result = emailTemplateService.validateTemplateVariables(
        template,
        enrichment,
        prospect
      );

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('pain_point_1');
    });
  });
});

