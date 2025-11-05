import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, ensureUserExists } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * Auth middleware - Verify JWT token and attach user to request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        'Missing or invalid authorization header',
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const userInfo = await verifyToken(token);

    if (!userInfo) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        'Invalid or expired token',
        401
      );
    }

    // Ensure user exists in users table
    await ensureUserExists(userInfo.userId, userInfo.email);

    // Attach user to request for downstream handlers
    (request as any).user = userInfo;

  } catch (error) {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return reply.status(401).send({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Optional auth middleware - Attaches user if token present, but doesn't require it
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userInfo = await verifyToken(token);

      if (userInfo) {
        await ensureUserExists(userInfo.userId, userInfo.email);
        (request as any).user = userInfo;
      }
    }
  } catch (error) {
    // Silent fail for optional auth
    console.warn('Optional auth failed:', error);
  }
}

// Alias for consistency
export { authMiddleware as requireAuth };

/**
 * Helper to get userId from request (throws if not authenticated)
 */
export function getUserId(request: FastifyRequest): string {
  if (!request.user?.userId) {
    throw new Error('User not authenticated');
  }
  return request.user.userId;
}
