# Sales Machine

AI-powered B2B sales automation platform for enterprise deal flow management.

## Overview

Sales Machine streamlines B2B sales processes through intelligent prospect enrichment, automated outreach orchestration, and real-time pipeline visibility. Built with TypeScript, React, and Fastify on a modern serverless stack.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Fastify (Node.js), TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **Orchestration**: N8N Cloud
- **AI**: Claude API (Anthropic)
- **Hosting**: Railway (API Gateway), Supabase (Database + Auth)

## Quick Start

### Prerequisites

- Node.js v20 LTS or higher
- npm v10 or higher
- Supabase CLI (install: `npm i -g supabase`)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd sales-machine

# Install dependencies
npm install

# Start local Supabase instance
supabase start

# Generate TypeScript types from database schema
npm run generate:types

# Start development servers (frontend + backend)
npm run dev
```

### Development Commands

```bash
npm run dev          # Start both frontend and backend
npm run dev:web      # Start frontend only (Vite on :5173)
npm run dev:api      # Start backend only (Fastify on :3000)
npm run build        # Build all workspaces
npm run lint         # Lint all workspaces
npm run type-check   # Type-check all workspaces
npm run test         # Run all tests
```

## Project Structure

```
sales-machine/
├── apps/
│   ├── web/           # React frontend (Vite)
│   └── api/           # Fastify backend (API Gateway)
├── packages/
│   └── shared/        # Shared types and utilities
├── workflows/         # N8N workflow definitions
├── mcp-servers/       # MCP server implementations
├── scripts/           # Deployment and utility scripts
├── docs/              # Documentation (PRD, architecture, stories)
└── tests/             # End-to-end tests
```

## Documentation

- [Local Development Setup](./docs/dev-setup.md)
- [Architecture Documentation](./docs/architecture/)
- [Product Requirements](./docs/prd/)

## License

Proprietary - All rights reserved
