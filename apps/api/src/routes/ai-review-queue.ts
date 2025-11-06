import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from '../lib/supabase';
import { AIReviewService } from '../services/AIReviewService';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export async function aiReviewQueueRoutes(fastify: FastifyInstance) {
  // Get pending review queue
  fastify.get(
    '/',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const reviewService = new AIReviewService(supabase);

      const queryParams = request.query as { filter?: 'vip' | 'non_vip' | 'all' };
      const filter = queryParams.filter || 'all';

      let reviews;
      if (filter === 'vip') {
        reviews = await reviewService.getVIPReviews(req.user.userId);
      } else if (filter === 'non_vip') {
        reviews = await reviewService.getNonVIPReviews(req.user.userId);
      } else {
        reviews = await reviewService.getPendingReviews(req.user.userId);
      }

      // Get counts for metadata
      const allReviews = await reviewService.getPendingReviews(req.user.userId);
      const vipCount = allReviews.filter(r => r.prospect?.is_vip === true).length;
      const nonVIPCount = allReviews.filter(r => !r.prospect?.is_vip).length;

      return reply.send({
        success: true,
        data: reviews,
        filter,
        vip_count: vipCount,
        non_vip_count: nonVIPCount,
      });
    }
  );

  // Approve message
  fastify.post(
    '/:id/approve',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const reviewService = new AIReviewService(supabase);

      const params = request.params as { id: string };
      await reviewService.approveMessage(req.user.userId, params.id);

      return reply.send({
        success: true,
        message: 'Message approved and queued for sending',
      });
    }
  );

  // Edit and approve message
  fastify.post(
    '/:id/edit',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const reviewService = new AIReviewService(supabase);

      const params = request.params as { id: string };
      const body = request.body as {
        edited_subject?: string;
        edited_message?: string;
      };

      await reviewService.editMessage(
        req.user.userId,
        params.id,
        body.edited_subject,
        body.edited_message
      );

      return reply.send({
        success: true,
        message: 'Message edited and queued for sending',
      });
    }
  );

  // Reject message
  fastify.post(
    '/:id/reject',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const reviewService = new AIReviewService(supabase);

      const params = request.params as { id: string };
      const body = request.body as { reason?: string };

      await reviewService.rejectMessage(
        req.user.userId,
        params.id,
        body.reason
      );

      return reply.send({
        success: true,
        message: 'Message rejected',
      });
    }
  );

  // Bulk approve
  fastify.post(
    '/bulk-approve',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const reviewService = new AIReviewService(supabase);

      const body = request.body as { review_ids: string[] };

      await reviewService.bulkApprove(req.user.userId, body.review_ids);

      return reply.send({
        success: true,
        message: `${body.review_ids.length} messages approved and sent`,
      });
    }
  );

  // Bulk reject
  fastify.post(
    '/bulk-reject',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const supabase = createSupabaseClient(
        request.headers.authorization!.substring(7)
      );
      const reviewService = new AIReviewService(supabase);

      const body = request.body as { review_ids: string[]; reason?: string };

      await reviewService.bulkReject(req.user.userId, body.review_ids, body.reason);

      return reply.send({
        success: true,
        message: `${body.review_ids.length} messages rejected`,
      });
    }
  );
}
