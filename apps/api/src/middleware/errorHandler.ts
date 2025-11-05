import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ApiError, ErrorCode } from '../types';

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
