# Development Workflow

## Local Development Setup

**Prerequisites:**
```bash
node -v  # v20 LTS
npm -v   # v10+
supabase --version  # Latest
```

**Initial Setup:**
```bash
# Clone repository
git clone <repo-url>
cd sales-machine

# Install dependencies
npm install

# Start Supabase local
supabase start

# Generate types
npm run generate:types

# Start dev servers (parallel)
npm run dev  # Runs both web and api
```

**Development Commands:**
```bash
# Frontend only
npm run dev:web

# Backend only
npm run dev:api

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint

# Deploy N8N workflows to N8N Cloud
npm run deploy:workflows
```

## N8N Workflow Deployment

**Automated Deployment Script** (`scripts/deploy-workflows.sh`):

```bash
#!/bin/bash
set -e

echo "Deploying N8N workflows to N8N Cloud..."

if [ -z "$N8N_API_KEY" ]; then
  echo "Error: N8N_API_KEY environment variable not set"
  exit 1
fi

for workflow in workflows/*.json; do
  echo "Uploading $(basename $workflow)..."
  curl -X POST "https://n8n.cloud/api/v1/workflows/import" \
    -H "X-N8N-API-Key: $N8N_API_KEY" \
    -H "Content-Type: multipart/form-data" \
    -F "file=@$workflow" \
    --fail-with-body
done

echo "✅ All workflows deployed successfully"
```

**Usage:**
```bash
# Deploy all workflows
chmod +x scripts/deploy-workflows.sh
N8N_API_KEY=<your_key> ./scripts/deploy-workflows.sh

# Or via npm script
npm run deploy:workflows
```

**Version Control:**
- N8N workflows stored as JSON in `/workflows` directory
- Export workflows from N8N UI → commit to Git
- Deploy script uploads latest versions to N8N Cloud
- Include workflow deployment in CI/CD pipeline (manual approval gate)

## Database Migration Management

**Migration Strategy:**

```bash
# Create new migration
supabase migration new add_feature_name

# Apply locally
supabase db reset

# Generate types after migration
npm run generate:types

# Push to production
supabase db push
```

**Backup and Rollback Procedures:**

```bash
# BEFORE MIGRATION: Create backup
supabase db dump -f backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql

# Apply migration
supabase db push

# IF MIGRATION FAILS: Rollback procedure
# 1. Stop application (prevent data writes)
railway down

# 2. Restore from backup
supabase db reset --db-url $SUPABASE_DB_URL
psql $SUPABASE_DB_URL < backups/pre-migration-20251005-143022.sql

# 3. Verify restoration
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM prospects;"

# 4. Restart application
railway up

# 5. Investigate migration failure, fix, retry
```

**Backup Retention Policy:**
- **Automatic:** Supabase daily backups (7 days retention on free tier)
- **Manual:** Weekly exports to S3 bucket (90 days retention)
- **Pre-Migration:** Mandatory backup before every production migration
- **Testing:** All migrations tested on staging environment first

## Environment Configuration

**Frontend (.env.local):**
```bash
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=<supabase_url>
VITE_SUPABASE_ANON_KEY=<anon_key>
```

**Backend (.env):**
```bash
DATABASE_URL=<supabase_connection_string>
REDIS_URL=<upstash_redis_url>
N8N_WEBHOOK_URL=<n8n_cloud_webhook_base>
N8N_API_KEY=<n8n_api_key>
CLAUDE_API_KEY=<anthropic_key>
INSTANTLY_API_KEY=<instantly_key>
CAL_COM_API_KEY=<cal_com_key>
```

---
