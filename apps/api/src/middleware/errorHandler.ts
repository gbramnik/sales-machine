import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ApiError, ErrorCode } from '../types';
import { captureException, setSentryUser } from '../lib/sentry';
import { AuthenticatedRequest } from '../types';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: FastifyError | ApiError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error (in production, send to monitoring service)
  console.error('Error:', {
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack,
  });

  // Capture error to Sentry with request context
  const requestContext = {
    method: request.method,
    url: request.url,
    path: request.routerPath || request.url,
    query: request.query,
    headers: {
      'user-agent': request.headers['user-agent'],
      'content-type': request.headers['content-type'],
    },
  };

  // Set user context if authenticated
  if ((request as any).user) {
    const user = (request as AuthenticatedRequest).user;
    setSentryUser(user.userId, user.email);
  }

  // Capture 4xx and 5xx errors to Sentry
  const statusCode = 'statusCode' in error ? error.statusCode : 
                     error instanceof ApiError ? error.statusCode : 500;
  
  // Only capture server errors (5xx) and critical client errors (4xx) to Sentry
  // Skip 401/403/404 as they're expected in normal operation
  if (statusCode >= 500 || (statusCode >= 400 && statusCode !== 401 && statusCode !== 403 && statusCode !== 404)) {
    captureException(error instanceof Error ? error : new Error(error.message), {
      request: requestContext,
      statusCode,
    });
  }

  // Handle ApiError (our custom errors)
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Handle Fastify validation errors
  if ('validation' in error && error.validation) {
    return reply.status(422).send({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: error.validation,
      },
    });
  }

  // Handle Fastify errors
  if ('statusCode' in error) {
    return reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
    });
  }

  // Generic error fallback
  return reply.status(500).send({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
    },
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${request.method} ${request.url} not found`,
    },
  });
}
