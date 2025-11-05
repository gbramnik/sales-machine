# Environment Variables - API Gateway

## Required Variables

### Server Configuration
```bash
NODE_ENV=development         # development | production
PORT=3000                    # API server port
HOST=0.0.0.0                # Listen on all interfaces
LOG_LEVEL=info              # debug | info | warn | error
```

### Frontend Configuration
```bash
FRONTEND_URL=http://localhost:5173  # For CORS (production: https://app.sales-machine.com)
```

### Supabase Configuration
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJxxx...        # Public anon key
SUPABASE_SERVICE_KEY=eyJxxx...      # Service role key (keep secret!)
```

### Upstash Redis Configuration
```bash
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=Axxx...
```

### Security
```bash
JWT_SECRET=your-secret-key-here     # Generate with: openssl rand -base64 32
```

## Optional Variables

### Monitoring
```bash
SENTRY_DSN=https://xxx@sentry.io/xxx    # Error tracking
```

## Notes

### API Keys Stored in Database
The following API keys are **NOT** stored as environment variables.
They are configured via the **Settings Panel UI** and stored encrypted in the `api_credentials` table:

- OpenAI API Key
- UniPil API Key
- Instantly.ai / Smartlead API Key
- Cal.com / Calendly API Key
- N8N Webhook URLs

This approach allows:
- ✅ Multi-user support (each user has their own keys)
- ✅ Dynamic configuration without redeployment
- ✅ Encryption at rest
- ✅ Verification and testing via UI

## Railway Deployment

When deploying to Railway, add these variables in the Railway dashboard:

1. Go to your project → Variables
2. Add all required variables above
3. Railway will auto-restart on changes

## Local Development

Create a `.env` file in `apps/api/`:

```bash
cp .env.example .env
# Edit .env with your values
```

**Never commit `.env` to git!**




