# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** Railway (Static hosting)
- **Build Command:** `npm run build --workspace=apps/web`
- **Output Directory:** `apps/web/dist`
- **CDN/Edge:** Railway built-in CDN

**Backend Deployment:**
- **Platform:** Railway (Node.js service)
- **Build Command:** `npm run build --workspace=apps/api`
- **Start Command:** `node apps/api/dist/server.js`
- **Deployment Method:** Git push to main → auto-deploy

## CI/CD Pipeline

**GitHub Actions (.github/workflows/ci.yaml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run generate:types
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
```

**Deployment (.github/workflows/deploy.yaml):**
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Railway auto-deploys on push to main"
      # Railway GitHub integration handles deployment
```

## Rollback Procedures

**Railway Deployment Rollback:**

```bash
# Method 1: Revert Git commit (recommended)
git revert <failing-commit-hash>
git push origin main
# Railway auto-deploys reverted version (~3 min)

# Method 2: Railway CLI rollback to previous deployment
railway rollback --environment production
# Rollback completes in ~2 minutes

# Method 3: Manual deployment selection (Railway Dashboard)
# 1. Go to Railway dashboard → Deployments
# 2. Select last known good deployment
# 3. Click "Redeploy" button
```

**Verification After Rollback:**
```bash
# Check API health
curl https://api.sales-machine.com/health

# Check frontend loads
curl -I https://app.sales-machine.com

# Verify database connectivity
psql $SUPABASE_DB_URL -c "SELECT 1;"
```

**Rollback SLA:** <5 minutes from issue detection to rollback completion

## Load Balancing & Scaling

**Current Architecture (Micro-MVP):**
- Single Railway instance for API Gateway
- Stateless design enables horizontal scaling when needed

**Phase 2 Scaling Strategy (>100 users):**
```yaml
# Railway auto-scaling configuration
instances:
  min: 1
  max: 5
  target_cpu: 70%  # Scale when CPU >70%
  target_memory: 80%
```

**Session Management for Scaling:**
- Session tokens stored in Upstash Redis (not in-memory)
- Any API instance can validate any user session
- No sticky sessions required

**Load Balancing:**
- Railway provides automatic load balancing across instances
- Health checks: `GET /health` endpoint (must return 200)
- Graceful shutdown: 30s timeout for in-flight requests

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|-------------|-------------|---------|
| Development | localhost:5173 | localhost:3000 | Local development |
| Staging | staging.sales-machine.com | api-staging.sales-machine.com | Pre-production testing |
| Production | app.sales-machine.com | api.sales-machine.com | Live environment |

---
