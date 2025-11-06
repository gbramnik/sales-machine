import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { VIPDetectionService } from '../services/VIPDetectionService';
import { ApiError, ErrorCode } from '../types';

/**
 * VIP Routes
 * 
 * Endpoints for VIP detection and management.
 * Some endpoints may be called from N8N workflows without authentication.
 */
export async function vipRoutes(fastify: FastifyInstance) {
  // VIP detection endpoint (for N8N workflows)
  // This endpoint can be called without auth if called from N8N with service token
  fastify.post(
    '/detect',
    async (request, reply) => {
      // Validate request body
      const detectVIPSchema = z.object({
        job_title: z.string().nullable().optional(),
      });

      const body = request.body as any;
      const validationResult = detectVIPSchema.safeParse(body);

      if (!validationResult.success) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          400,
          validationResult.error.errors
        );
      }

      const vipService = new VIPDetectionService(supabaseAdmin);
      const isVIP = vipService.detectVIPFromJobTitle(validationResult.data.job_title || null);
      const reason = isVIP ? 'Auto-detected: C-level title' : null;

      return reply.send({
        success: true,
        data: {
          is_vip: isVIP,
          reason,
        },
      });
    }
  );
}

