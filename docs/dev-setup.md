# Local Development Setup

Complete guide for setting up the Sales Machine development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20 LTS or higher
  - Check: `node --version`
  - Install: https://nodejs.org/
- **npm**: v10 or higher
  - Check: `npm --version`
  - Comes with Node.js
- **Git**: Latest version
  - Check: `git --version`
  - Install: https://git-scm.com/
- **Supabase CLI**: Latest version
  - Check: `supabase --version`
  - Install: `npm install -g supabase`

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/gbramnik/sales-machine.git
cd sales-machine
```

### 2. Install Dependencies

Install all workspace dependencies from the root:

```bash
npm install
```

This will install dependencies for:
- `apps/web` (React frontend)
- `apps/api` (Fastify backend)
- `packages/shared` (Shared types and utilities)

### 3. Environment Configuration

#### Frontend Environment (apps/web/.env.local)

The file `apps/web/.env.local` should already exist with:

```bash
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://sizslvtrbuldfzaoygbs.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

#### Backend Environment (apps/api/.env)

The file `apps/api/.env` should already exist with all necessary credentials.

**Note**: Never commit `.env` or `.env.local` files to version control.

### 4. Start Local Supabase (Optional)

For local development with Supabase:

```bash
supabase start
```

This starts a local Supabase instance with:
- PostgreSQL database
- Auth server
- Realtime server
- Storage server

### 5. Generate TypeScript Types

Generate types from Supabase schema:

```bash
npm run generate:types
```

This creates `packages/shared/src/types/database.types.ts` from your Supabase schema.

## Development Commands

### Start All Services

Start both frontend and backend in parallel:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Start Individual Services

Start only the frontend:

```bash
npm run dev:web
```

Start only the backend:

```bash
npm run dev:api
```

### Build All Workspaces

```bash
npm run build
```

Or build individual workspaces:

```bash
npm run build:web
npm run build:api
```

### Linting

Run ESLint on all workspaces:

```bash
npm run lint
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Testing

Run all tests:

```bash
npm run test
```

Run tests for specific workspace:

```bash
npm run test --workspace=apps/api
npm run test --workspace=apps/web
```

### N8N Workflow Deployment

Deploy workflows to N8N Cloud:

```bash
npm run deploy:workflows
```

## Project Structure

```
sales-machine/
├── .github/workflows/    # GitHub Actions CI/CD
├── apps/
│   ├── web/             # React frontend (Vite)
│   │   ├── src/         # Source files
│   │   ├── tests/       # Frontend tests
│   │   └── package.json
│   └── api/             # Fastify backend
│       ├── src/         # Source files
│       ├── tests/       # Backend tests
│       └── package.json
├── packages/
│   └── shared/          # Shared types and utilities
│       ├── src/types/   # TypeScript type definitions
│       └── package.json
├── workflows/           # N8N workflow definitions (JSON)
├── scripts/             # Deployment and utility scripts
├── docs/                # Documentation
│   ├── prd/            # Product requirements
│   ├── architecture/   # Architecture docs
│   └── stories/        # User stories
└── package.json         # Root workspace configuration
```

## Common Development Tasks

### Adding a New Dependency

For frontend:
```bash
npm install <package-name> --workspace=apps/web
```

For backend:
```bash
npm install <package-name> --workspace=apps/api
```

For shared package:
```bash
npm install <package-name> --workspace=packages/shared
```

### Updating Supabase Types

After making database schema changes:

```bash
npm run generate:types
```

### Checking Service Health

Frontend health check:
```bash
curl http://localhost:5173
```

Backend health check:
```bash
curl http://localhost:3000/health
```

Production API health check:
```bash
curl https://sales-machine-production.up.railway.app/health
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find process using port
lsof -ti:3000
lsof -ti:5173

# Kill process
kill -9 <PID>
```

### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf package-lock.json
npm install
```

### TypeScript Errors After Schema Changes

Regenerate types:

```bash
npm run generate:types
npm run type-check
```

### Supabase Connection Issues

Check Supabase local instance:

```bash
supabase status
```

Restart Supabase:

```bash
supabase stop
supabase start
```

### Build Failures

Clean build artifacts:

```bash
rm -rf apps/*/dist packages/*/dist
npm run build
```

## Environment Variables Reference

### Frontend (.env.local in apps/web/)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API Gateway URL | `http://localhost:3000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |

### Backend (.env in apps/api/)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Upstash Redis REST URL | Yes |
| `REDIS_TOKEN` | Upstash Redis REST token | Yes |
| `N8N_WEBHOOK_URL` | N8N webhook base URL | Yes |
| `N8N_API_KEY` | N8N API key | Yes |
| `CLAUDE_API_KEY` | Claude API key | Yes |
| `UNIPIL_API_KEY` | UniPil API key for LinkedIn automation | Yes |
| `SMTP_HOST` | SMTP server host (SendGrid/Mailgun/AWS SES) | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |
| `EMAIL_FINDER_API_KEY` | Email finder API key (Enrow) | Later |
| `TAVILY_API_KEY` | Tavily API key (search & web extract) | Later |
| `CAL_COM_API_KEY` | Cal.com API key | Later |

> **Enrow API Key:** Configure `EMAIL_FINDER_API_KEY` locally (and in managed secrets) with your Enrow token (format `enrow-XXXX-XXXX`). Never commit real keys to version control; rotate immediately if exposure is suspected.
> **Tavily API Key:** Store `TAVILY_API_KEY` with your Tavily Search/Extract token (format `tvly-XXXX...`). This key enables profile/company scraping enrichments. Rotate if leaked.

## Next Steps

- Review [Architecture Documentation](./architecture/)
- Read [Product Requirements](./prd/)
- Check [User Stories](./stories/)
- Join development workflow using [BMAD Core](./.bmad-core/)

## Getting Help

- Check existing GitHub Issues
- Review architecture documentation
- Consult PRD for feature context
