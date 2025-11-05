# Supabase Database Setup

## Overview

This directory contains the complete database schema, migrations, and configuration for the Sales Machine application.

## Files Structure

```
supabase/
├── config.toml                              # Supabase configuration
├── migrations/
│   ├── 20251006000001_initial_schema.sql   # Core tables & indexes
│   ├── 20251006000002_rls_policies.sql     # Row Level Security policies
│   └── 20251006000003_seed_data.sql        # System templates & helper functions
└── README.md                                # This file
```

## Database Schema

### Tables

1. **users** - User accounts (extends Supabase auth.users)
2. **campaigns** - Prospecting campaigns with ICP criteria
3. **prospects** - Scraped LinkedIn profiles
4. **prospect_enrichment** - AI-generated talking points
5. **email_templates** - Proven email templates
6. **ai_conversation_log** - Complete conversation history
7. **meetings** - Scheduled meetings via Cal.com
8. **ai_review_queue** - AI messages awaiting approval
9. **audit_log** - GDPR compliance tracking

### Key Features

- ✅ Full Row Level Security (RLS) on all tables
- ✅ Multi-tenant isolation (`auth.uid() = user_id`)
- ✅ Performance indexes on frequently queried columns
- ✅ Realtime subscriptions for activity stream
- ✅ Helper functions for health scores & stats
- ✅ System email templates preloaded

## Migration Options

### Option 1: Supabase Remote (Recommended for Quick Start)

**Prerequisites:**
- Supabase account with project created
- Supabase CLI installed: `npm install -g supabase`

**Steps:**

1. Link to your remote project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

2. Push migrations:
```bash
supabase db push
```

3. Verify in Supabase Studio:
```
https://app.supabase.com/project/YOUR_PROJECT_REF/editor
```

### Option 2: Local Supabase (For Development)

**Prerequisites:**
- Docker Desktop installed and running
- Supabase CLI installed

**Steps:**

1. Start local Supabase:
```bash
supabase start
```

2. Apply migrations:
```bash
supabase db reset
```

3. Access local Studio:
```
http://localhost:54323
```

4. Local connection details:
```
Database URL: postgresql://postgres:postgres@localhost:54322/postgres
API URL: http://localhost:54321
Anon Key: (shown after supabase start)
```

### Option 3: Automated Migration Script

Use our helper script:

```bash
./scripts/migrate-supabase.sh
```

Then select:
- `1` for local Supabase
- `2` for remote production
- `3` to list pending migrations

## Environment Variables

After migration, update your `.env` files:

**Frontend (`apps/web/.env.local`):**
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (`apps/api/.env`):**
```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres
```

## Verifying the Migration

After applying migrations, verify:

1. **Tables created:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

2. **RLS enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

3. **System templates loaded:**
```sql
SELECT name, use_case
FROM email_templates
WHERE is_system_template = TRUE;
```

## Helper Functions

The migration includes several PostgreSQL functions:

- `replace_template_variables(template_text, variables)` - Replace {{placeholders}}
- `get_pending_review_count(user_id)` - Count pending AI reviews
- `get_campaign_stats(campaign_id)` - Calculate campaign metrics
- `calculate_health_score(user_id)` - Calculate user health score

### Example Usage:

```sql
-- Get health score
SELECT * FROM calculate_health_score('user-uuid-here');

-- Replace template variables
SELECT replace_template_variables(
  'Hi {{name}}, welcome to {{company}}!',
  '{"name": "John", "company": "Acme"}'::jsonb
);
```

## Row Level Security (RLS)

All tables enforce multi-tenant isolation:

```sql
-- Users can only see their own data
POLICY "Users can view own campaigns"
  ON campaigns
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Testing RLS:**
```sql
-- This should only return current user's data
SELECT * FROM prospects;
```

## Realtime Subscriptions

Enabled for activity stream tables:

- `ai_conversation_log`
- `ai_review_queue`
- `meetings`
- `prospects`

**Frontend usage:**
```typescript
supabase
  .channel('ai-activity')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'ai_conversation_log'
  }, (payload) => {
    console.log('New activity:', payload);
  })
  .subscribe();
```

## Troubleshooting

### Migration fails with "relation already exists"

Reset the database:
```bash
supabase db reset --local
```

### RLS policies blocking queries

Make sure you're authenticated:
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Authenticated as:', session?.user?.id);
```

### Docker not running (local Supabase)

Start Docker Desktop, then:
```bash
supabase start
```

### Permission denied on functions

Grant execute permissions:
```sql
GRANT EXECUTE ON FUNCTION calculate_health_score TO authenticated;
```

## Next Steps

After successful migration:

1. ✅ Update environment variables
2. ✅ Test database connection in backend
3. ✅ Implement API routes
4. ✅ Connect frontend to Supabase
5. ✅ Test authentication flow

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)
