# 🔗 Liens Importants - Sales Machine

## 🗄️ Supabase

### Dashboard Principal
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs

### Configuration API (Récupérer les clés)
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/settings/api

### SQL Editor (Appliquer les migrations)
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/sql/new

### Table Editor (Vérifier les tables)
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/editor

### Authentication (Configurer OAuth)
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/auth/providers

### Logs
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/logs

### Database
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/database/tables

---

## 🌐 Application Locale

### Frontend
http://localhost:5173

### Backend API
http://localhost:3000

### Health Check
http://localhost:3000/health

### API Routes
- http://localhost:3000/users/me
- http://localhost:3000/dashboard/stats
- http://localhost:3000/prospects
- http://localhost:3000/ai-review-queue

---

## 📚 Documentation

### Documentation Projet
- [README.md](./README.md) - Vue d'ensemble
- [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md) - Setup en 5 minutes
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guide migrations
- [STATUS.md](./STATUS.md) - État du projet
- [LINKS.md](./LINKS.md) - Ce fichier

### Documentation Technique
- [apps/api/README.md](./apps/api/README.md) - Documentation API
- [apps/web/README.md](./apps/web/README.md) - Documentation Frontend
- [packages/shared/README.md](./packages/shared/README.md) - Types partagés

---

## 🔧 Configuration Requise

### Étape 1: Récupérer SERVICE_ROLE_KEY
**URL:** https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/settings/api

1. Aller dans "Project API keys"
2. Copier la clé "service_role" (secret, commence par `eyJhbGc...`)
3. Mettre à jour `apps/api/.env`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### Étape 2: Appliquer Migrations
**URL:** https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/sql/new

Exécuter dans l'ordre:
1. [supabase/migrations/20251006000001_initial_schema.sql](./supabase/migrations/20251006000001_initial_schema.sql)
2. [supabase/migrations/20251006000002_rls_policies.sql](./supabase/migrations/20251006000002_rls_policies.sql)
3. [supabase/migrations/20251006000003_seed_data.sql](./supabase/migrations/20251006000003_seed_data.sql)

### Étape 3: Vérifier Tables
**URL:** https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/editor

Vérifier que ces 9 tables existent:
- ✅ users
- ✅ campaigns
- ✅ prospects
- ✅ prospect_enrichment
- ✅ email_templates (doit contenir 5 templates)
- ✅ ai_conversation_log
- ✅ meetings
- ✅ ai_review_queue
- ✅ audit_log

---

## 🔐 OAuth Configuration (À faire plus tard)

### Google OAuth
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/auth/providers

Configuration:
1. Créer projet Google Cloud: https://console.cloud.google.com
2. Créer OAuth 2.0 Client ID
3. Callback URL: `https://sizslvtrbuldfzaoygbs.supabase.co/auth/v1/callback`
4. Copier Client ID et Secret dans Supabase

### LinkedIn OAuth
https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/auth/providers

Configuration:
1. Créer app LinkedIn: https://www.linkedin.com/developers/apps
2. Activer Sign In with LinkedIn
3. Callback URL: `https://sizslvtrbuldfzaoygbs.supabase.co/auth/v1/callback`
4. Copier Client ID et Secret dans Supabase

---

## 🚀 Déploiement (À configurer plus tard)

### Railway (Backend API)
- Dashboard: https://railway.app
- Project: À créer
- Variables d'environnement à configurer

### Vercel/Netlify (Frontend)
- Dashboard: https://vercel.com ou https://netlify.com
- Project: À créer
- Build command: `npm run build:web`
- Output directory: `apps/web/dist`

---

## 📊 Monitoring (À configurer plus tard)

### Sentry (Error Tracking)
- Dashboard: https://sentry.io
- Project: À créer

### Upstash Redis (Cache)
- Dashboard: https://console.upstash.com
- Database: À créer

### N8N Cloud (Automation)
- Dashboard: https://app.n8n.cloud
- Workflow: À créer

---

## 🛠️ Outils Développement

### GitHub Repository
- Repo: (À ajouter votre URL)
- Actions: (À ajouter votre URL)/actions
- Issues: (À ajouter votre URL)/issues

### Package Managers
- npm: https://www.npmjs.com
- pnpm (alternative): https://pnpm.io

### TypeScript
- Playground: https://www.typescriptlang.org/play
- Documentation: https://www.typescriptlang.org/docs

---

## 📖 Documentation Externe

### Supabase
- Docs: https://supabase.com/docs
- API Reference: https://supabase.com/docs/reference
- CLI: https://supabase.com/docs/guides/cli

### Fastify
- Docs: https://fastify.dev/docs
- Plugins: https://fastify.dev/ecosystem

### React
- Docs: https://react.dev
- Router: https://reactrouter.com

### Tailwind CSS
- Docs: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

### Claude API
- Docs: https://docs.anthropic.com
- Console: https://console.anthropic.com

---

## 🆘 Support

### Documentation Projet
1. Lire [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)
2. Consulter [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
3. Vérifier [STATUS.md](./STATUS.md)

### Supabase Support
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase/discussions

### Stack Overflow
- Tag Supabase: https://stackoverflow.com/questions/tagged/supabase
- Tag Fastify: https://stackoverflow.com/questions/tagged/fastify
- Tag React: https://stackoverflow.com/questions/tagged/reactjs

---

**Dernière mise à jour:** 6 Octobre 2025
**Prochaine action:** Suivre [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)
