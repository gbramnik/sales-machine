import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from '../lib/supabase';
import { UserService } from '../services/UserService';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export async function usersRoutes(fastify: FastifyInstance) {
  // Get current user profile
  fastify.get(
    '/me',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const userService = new UserService(supabase);

      const user = await userService.getCurrentUser(authRequest.user.userId);

      return reply.send({
        success: true,
        data: user,
      });
    }
  );

  // Update current user profile
  fastify.patch(
    '/me',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const userService = new UserService(supabase);

      const updates = authRequest.body as any;
      const user = await userService.updateUser(authRequest.user.userId, updates);

      return reply.send({
        success: true,
        data: user,
      });
    }
  );

  // Get domain verification status (Story 1.5 - Task 2)
  fastify.get(
    '/me/domain-status',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );

      const { data: user, error } = await supabase
        .from('users')
        .select('domain_verification_status, domain_warmup_started_at')
        .eq('id', authRequest.user.userId)
        .single();

      if (error || !user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found',
        });
      }

      return reply.send({
        success: true,
        data: {
          verification_status: user.domain_verification_status || {
            spf: false,
            dkim: false,
            dmarc: false,
            verified_at: null,
          },
          warmup_started_at: user.domain_warmup_started_at,
        },
      });
    }
  );
}
