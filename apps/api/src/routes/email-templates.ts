import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { emailTemplateService } from '../services/email-template.service';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

// Validation schemas
const previewTemplateSchema = z.object({
  prospect_id: z.string().uuid(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  use_case: z.enum(['cold_intro', 'follow_up_no_reply', 'follow_up_engaged', 're_engagement', 'meeting_confirmation', 'custom']).optional(),
  subject_line: z.string().nullable().optional(),
  body: z.string().min(1),
  channel: z.enum(['linkedin', 'email', 'both']).default('email'),
  linkedin_message_preview: z.string().max(300).nullable().optional(),
  variables_required: z.array(z.string()).default([]),
  tone: z.enum(['conversational', 'professional', 'casual', 'formal']).default('conversational'),
  variant_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

const updateTemplateSchema = createTemplateSchema.partial();

export async function emailTemplatesRoutes(fastify: FastifyInstance) {
  // List all templates (user templates + system templates)
  fastify.get(
    '/email-templates',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      
      const queryParams = request.query as {
        channel?: 'linkedin' | 'email' | 'both';
        use_case?: string;
      };
      
      let query = supabaseAdmin
        .from('email_templates')
        .select('*')
        .or(`user_id.eq.${userId},is_system_template.eq.true`)
        .eq('is_active', true)
        .order('is_system_template', { ascending: false })
        .order('created_at', { ascending: false });
      
      // Filter by channel if specified
      if (queryParams.channel) {
        query = query.or(`channel.eq.${queryParams.channel},channel.eq.both`);
      }
      
      // Filter by use_case if specified
      if (queryParams.use_case) {
        query = query.eq('use_case', queryParams.use_case);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to fetch templates',
          500,
          error
        );
      }
      
      // Parse variables_required JSONB for each template
      const templates = (data || []).map(template => ({
        ...template,
        variables_required: Array.isArray(template.variables_required)
          ? template.variables_required
          : [],
      }));
      
      return reply.send({
        success: true,
        data: templates,
      });
    }
  );
  
  // Get single template by ID
  fastify.get(
    '/email-templates/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      const { id } = request.params as { id: string };
      
      const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .or(`user_id.eq.${userId},is_system_template.eq.true`)
        .single();
      
      if (error || !data) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          'Template not found or access denied',
          404
        );
      }
      
      // Parse variables_required JSONB
      const template = {
        ...data,
        variables_required: Array.isArray(data.variables_required)
          ? data.variables_required
          : [],
      };
      
      return reply.send({
        success: true,
        data: template,
      });
    }
  );
  
  // Preview template with prospect data
  fastify.post(
    '/email-templates/:id/preview',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            prospect_id: { type: 'string', format: 'uuid' },
          },
          required: ['prospect_id'],
        },
      },
    },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      const { id: templateId } = request.params as { id: string };
      const body = previewTemplateSchema.parse(request.body);
      
      try {
        const personalized = await emailTemplateService.personalizeTemplate(
          templateId,
          body.prospect_id,
          userId
        );
        
        return reply.send({
          success: true,
          data: personalized,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to preview template',
          500,
          error
        );
      }
    }
  );
  
  // Create user template
  fastify.post(
    '/email-templates',
    {
      preHandler: authMiddleware,
      schema: {
        body: createTemplateSchema,
      },
    },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      const data = createTemplateSchema.parse(request.body);
      
      const { data: template, error } = await supabaseAdmin
        .from('email_templates')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          use_case: data.use_case,
          subject_line: data.subject_line,
          body: data.body,
          channel: data.channel,
          linkedin_message_preview: data.linkedin_message_preview,
          variables_required: data.variables_required,
          tone: data.tone,
          variant_id: data.variant_id,
          is_active: data.is_active,
          is_system_template: false,
        })
        .select()
        .single();
      
      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to create template',
          500,
          error
        );
      }
      
      return reply.status(201).send({
        success: true,
        data: {
          ...template,
          variables_required: Array.isArray(template.variables_required)
            ? template.variables_required
            : [],
        },
      });
    }
  );
  
  // Update user template
  fastify.patch(
    '/email-templates/:id',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: updateTemplateSchema,
      },
    },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      const { id } = request.params as { id: string };
      const data = updateTemplateSchema.parse(request.body);
      
      // First check if template exists and belongs to user (not system template)
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('email_templates')
        .select('id, user_id, is_system_template')
        .eq('id', id)
        .single();
      
      if (fetchError || !existing) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          'Template not found',
          404
        );
      }
      
      if (existing.is_system_template) {
        throw new ApiError(
          ErrorCode.FORBIDDEN,
          'Cannot update system templates',
          403
        );
      }
      
      if (existing.user_id !== userId) {
        throw new ApiError(
          ErrorCode.FORBIDDEN,
          'Access denied',
          403
        );
      }
      
      const { data: template, error } = await supabaseAdmin
        .from('email_templates')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to update template',
          500,
          error
        );
      }
      
      return reply.send({
        success: true,
        data: {
          ...template,
          variables_required: Array.isArray(template.variables_required)
            ? template.variables_required
            : [],
        },
      });
    }
  );
  
  // Delete user template
  fastify.delete(
    '/email-templates/:id',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const userId = req.user.userId;
      const { id } = request.params as { id: string };
      
      // First check if template exists and belongs to user (not system template)
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('email_templates')
        .select('id, user_id, is_system_template')
        .eq('id', id)
        .single();
      
      if (fetchError || !existing) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          'Template not found',
          404
        );
      }
      
      if (existing.is_system_template) {
        throw new ApiError(
          ErrorCode.FORBIDDEN,
          'Cannot delete system templates',
          403
        );
      }
      
      if (existing.user_id !== userId) {
        throw new ApiError(
          ErrorCode.FORBIDDEN,
          'Access denied',
          403
        );
      }
      
      const { error } = await supabaseAdmin
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to delete template',
          500,
          error
        );
      }
      
      return reply.status(204).send();
    }
  );
}

