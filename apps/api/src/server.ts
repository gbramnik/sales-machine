import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({
  logger: true
});

// Register CORS
await server.register(cors, {
  origin: true
});

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Hello World endpoint
server.get('/', async () => {
  return {
    message: 'Sales Machine API Gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
