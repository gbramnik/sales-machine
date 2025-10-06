# Backend Architecture

## API Gateway Structure

```
apps/api/src/
├── routes/          # Fastify route handlers
├── middleware/      # Auth, rate limiting, error handling, audit log
├── services/        # Business logic (Campaign, Prospect, N8N, Cache)
├── utils/           # Logger, validators, errors
└── server.ts        # Fastify initialization
```

## Authentication Middleware

```typescript
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED' } });
  }

  request.user = user;
}
```

## Rate Limiting (Upstash Redis)

```typescript
export async function rateLimitMiddleware(request, reply) {
  const key = `rate_limit:${request.user.id}:${Math.floor(Date.now() / 60000)}`;
  const count = await redis.incr(key);
  await redis.expire(key, 60);

  if (count > 100) {
    return reply.status(429).send({ error: { code: 'RATE_LIMIT_EXCEEDED' } });
  }
}
```

## N8N Workflow Triggering

```typescript
export class N8NService {
  static async triggerLinkedInScraper(campaignId: string, icpParams: ICPParams) {
    const response = await axios.post(
      `${process.env.N8N_WEBHOOK_URL}/linkedin-scraper`,
      { campaign_id: campaignId, ...icpParams },
      { headers: { 'X-N8N-API-Key': process.env.N8N_API_KEY } }
    );
    return response.data.execution_id;
  }
}
```

---
