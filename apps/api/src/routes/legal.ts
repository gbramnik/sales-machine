import { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Legal Documents Routes
 * 
 * Serves legal documents (Privacy Policy, Terms of Service, etc.)
 */
export async function legalRoutes(fastify: FastifyInstance) {
  // Privacy Policy Endpoint
  fastify.get('/privacy-policy', async (request, reply) => {
    try {
      // Read privacy policy markdown file
      const privacyPolicyPath = join(
        process.cwd(),
        'docs',
        'legal',
        'privacy-policy.md'
      );
      
      const content = await readFile(privacyPolicyPath, 'utf-8');
      
      // Return as markdown (frontend can render it)
      reply.header('Content-Type', 'text/markdown; charset=utf-8');
      return reply.send(content);
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: {
          message: 'Privacy policy not found',
        },
      });
    }
  });
}

