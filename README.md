# Sales Machine

[![CI](https://github.com/gbramnik/sales-machine/actions/workflows/ci.yaml/badge.svg)](https://github.com/gbramnik/sales-machine/actions/workflows/ci.yaml)

AI-powered ultra-qualified LinkedIn prospecting platform. No Spray No Pray - Quality over Quantity.

## Overview

No Spray No Pray revolutionizes B2B prospecting by focusing on ultra-qualified LinkedIn prospects (20/day) with intelligent warm-up strategy (7-15 days) and multi-channel AI conversations. Built with TypeScript, React, and Fastify on a modern serverless stack.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Fastify (Node.js), TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **Orchestration**: N8N Cloud
- **AI**: Claude API (Anthropic)
- **LinkedIn**: UniPil API
- **Email**: Dedicated SMTP (SendGrid/Mailgun/AWS SES)
- **Hosting**: Railway (API Gateway), Supabase (Database + Auth)

## Quick Start

### Prerequisites

- Node.js v20 LTS or higher
- npm v10 or higher
- Compte Supabase (https://supabase.com)

### Setup Rapide (5 minutes)

**📖 Suivez le guide détaillé:** [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)

```bash
# 1. Cloner et installer
git clone <repository-url>
cd sales-machine
npm install

# 2. Configurer Supabase
# - Ouvrez: https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/settings/api
# - Copiez la SERVICE_ROLE_KEY
# - Mettez à jour apps/api/.env

# 3. Appliquer les migrations
# - Ouvrez le SQL Editor dans Supabase
# - Exécutez les 3 fichiers dans supabase/migrations/

# 4. Démarrer l'application
npm run dev
```

**Frontend:** http://localhost:5173
**Backend API:** http://localhost:3000
**Health Check:** http://localhost:3000/health

### Documentation Complète

- 🚀 [Guide de Démarrage Rapide](./DEMARRAGE_RAPIDE.md) - Configuration en 5 minutes
- 📦 [Guide de Migration Supabase](./MIGRATION_GUIDE.md) - Instructions détaillées des migrations
- 🔧 [Script de Setup](./setup-supabase.sh) - Script automatisé de configuration

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
