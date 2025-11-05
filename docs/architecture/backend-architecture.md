# Backend Architecture

## API Gateway Structure

```
apps/api/src/
├── routes/          # Fastify route handlers
├── middleware/      # Auth, rate limiting, error handling, audit log
├── services/        # Business logic (Campaign, Prospect, UniPil, SMTP, Warmup, N8N, Cache)
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

## LinkedIn Automation (UniPil Service)

```typescript
export class UniPilService {
  static async searchProspects(icpParams: ICPParams, personaParams: PersonaParams) {
    const response = await fetch(`${process.env.UNIPIL_API_URL}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNIPIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...icpParams, ...personaParams }),
    });
    return response.json();
  }

  static async warmupAction(prospectId: string, action: 'like' | 'comment', targetPostUrl: string) {
    // UniPil API call for warm-up actions
  }

  static async sendConnectionRequest(prospectId: string, message: string) {
    // UniPil API call for connection request
  }

  static async sendLinkedInMessage(prospectId: string, message: string) {
    // UniPil API call for LinkedIn messaging
  }
}
```

## SMTP Email Service

```typescript
export class SMTPService {
  private provider: 'sendgrid' | 'mailgun' | 'ses';

  async sendEmail(to: string, subject: string, body: string, from: string) {
    switch (this.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(to, subject, body, from);
      case 'mailgun':
        return this.sendViaMailgun(to, subject, body, from);
      case 'ses':
        return this.sendViaSES(to, subject, body, from);
    }
  }

  private async sendViaSendGrid(to: string, subject: string, body: string, from: string) {
    // SendGrid API implementation
  }
}
```

## LinkedIn Warm-up Service

```typescript
export class WarmupService {
  static async scheduleWarmup(prospectId: string, userId: string, durationDays: number) {
    // Create warmup schedule in database
    // Start daily warm-up actions
  }

  static async executeDailyActions(userId: string) {
    // Get prospects in warm-up phase
    // Execute likes/comments within daily limits
    // Track actions in Redis + Supabase
  }

  static async checkReadyForConnection(prospectId: string): Promise<boolean> {
    // Check if warm-up period completed
    // Return true if ready for connection request
  }
}
```

## N8N Workflow Triggering

```typescript
export class N8NService {
  static async triggerDailyDetection(userId: string) {
    const response = await axios.post(
      `${process.env.N8N_WEBHOOK_URL}/daily-prospect-detection`,
      { user_id: userId },
      { headers: { 'X-N8N-API-Key': process.env.N8N_API_KEY } }
    );
    return response.data.execution_id;
  }

  static async triggerWarmupWorkflow(prospectId: string) {
    const response = await axios.post(
      `${process.env.N8N_WEBHOOK_URL}/linkedin-warmup`,
      { prospect_id: prospectId },
      { headers: { 'X-N8N-API-Key': process.env.N8N_API_KEY } }
    );
    return response.data.execution_id;
  }
}
```

---
