import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

/**
 * Test routes for development/testing purposes
 * WARNING: These routes should be protected or disabled in production
 */
export async function testRoutes(fastify: FastifyInstance) {
  // Test error endpoint for Sentry validation
  // Only available in non-production environments or with admin access
  fastify.get(
    '/test-error',
    {
      preHandler: authMiddleware, // Require authentication
    },
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      
      // Only allow in development/staging, or add admin check
      if (process.env.NODE_ENV === 'production') {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Test endpoint not available in production',
          },
        });
      }

      // Throw test error for Sentry validation
      throw new Error('Test error for Sentry integration');
    }
  );
}

