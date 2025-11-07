# 📋 Référence Complète des Variables d'Environnement et URLs d'API

Document de référence pour toutes les variables d'environnement et URLs d'API nécessaires au fonctionnement de Sales Machine.

**Dernière mise à jour:** 2025-11-07

---

## 📁 Structure des Fichiers d'Environnement

### Frontend (`apps/web/.env.local`)
Variables d'environnement pour l'application React (préfixe `VITE_`)

### Backend (`apps/api/.env`)
Variables d'environnement pour l'API Gateway (Node.js/Fastify)

---

## 🌐 Frontend - Variables d'Environnement

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `VITE_API_URL` | URL de l'API Gateway | `http://localhost:3000` (dev)<br>`https://api.sales-machine.com` (prod) | ✅ Oui |
| `VITE_SUPABASE_URL` | URL du projet Supabase | `https://sizslvtrbuldfzaoygbs.supabase.co` | ✅ Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase (publique) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Oui |
| `VITE_SENTRY_DSN_FRONTEND` | Sentry DSN pour le frontend | `https://xxx@sentry.io/xxx` | ❌ Optionnel |
| `VITE_SENTRY_ENVIRONMENT` | Environnement Sentry | `development` \| `staging` \| `production` | ❌ Optionnel |

---

## 🔧 Backend - Configuration Serveur

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `NODE_ENV` | Environnement d'exécution | `development` \| `production` | ✅ Oui |
| `PORT` | Port d'écoute du serveur API | `3000` | ✅ Oui |
| `HOST` | Interface d'écoute | `0.0.0.0` | ✅ Oui |
| `LOG_LEVEL` | Niveau de log | `debug` \| `info` \| `warn` \| `error` | ❌ Optionnel (défaut: `info`) |
| `FRONTEND_URL` | URL du frontend (pour CORS) | `http://localhost:5173` (dev)<br>`https://app.sales-machine.com` (prod) | ✅ Oui |

---

## 🗄️ Supabase - Configuration Base de Données

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `SUPABASE_URL` | URL du projet Supabase | `https://sizslvtrbuldfzaoygbs.supabase.co` | ✅ Oui |
| `SUPABASE_ANON_KEY` | Clé anonyme Supabase (publique) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (secrète) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Oui |
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres` | ❌ Optionnel (si SERVICE_ROLE_KEY utilisé) |
| `ENCRYPTION_KEY` | Clé de chiffrement pour les API keys | Généré avec: `openssl rand -base64 32` | ❌ Optionnel (utilise SERVICE_ROLE_KEY si absent) |

**🔗 Où trouver ces valeurs:**
- Dashboard Supabase: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
- **⚠️ IMPORTANT:** Ne jamais commiter `SUPABASE_SERVICE_ROLE_KEY` dans Git!

---

## 🔴 Upstash Redis - Configuration Cache

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `UPSTASH_REDIS_URL` | URL REST de Redis | `https://xxx.upstash.io` | ✅ Oui |
| `UPSTASH_REDIS_TOKEN` | Token d'authentification Redis | `Axxx...` | ✅ Oui |
| `UPSTASH_REDIS_REST_URL` | Alias pour UPSTASH_REDIS_URL | `https://xxx.upstash.io` | ❌ Optionnel (alias) |
| `UPSTASH_REDIS_REST_TOKEN` | Alias pour UPSTASH_REDIS_TOKEN | `Axxx...` | ❌ Optionnel (alias) |
| `UPSTASH_API_KEY` | Clé API Upstash (pour monitoring) | `xxx` | ❌ Optionnel |

**🔗 Où trouver ces valeurs:**
- Dashboard Upstash: https://console.upstash.com
- Créer une base Redis → Copier REST URL et Token

---

## 🤖 N8N - Configuration Automatisation

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `N8N_WEBHOOK_URL` | URL de base des webhooks N8N (fallback) | `https://n8n.srv997159.hstgr.cloud/webhook` | ⚠️ Optionnel* |
| `N8N_WEBHOOK_TOKEN` | Token d'authentification webhook | `xxx` | ❌ Optionnel |
| `N8N_API_KEY` | Clé API N8N (pour monitoring) | `xxx` | ❌ Optionnel |
| `N8N_BASE_URL` | URL de base de l'instance N8N | `https://n8n.srv997159.hstgr.cloud` | ❌ Optionnel |

**⚠️ Important - Configuration des Webhooks :**

Il y a **deux méthodes** pour configurer les webhooks N8N :

### **Méthode 1 : URL de Base (Fallback)** ⚠️
La variable `N8N_WEBHOOK_URL` est utilisée comme **fallback** dans certains endroits du code où les URLs sont construites dynamiquement avec des chemins :
- `{N8N_WEBHOOK_URL}/daily-detection/manual`
- `{N8N_WEBHOOK_URL}/ai-enrichment`

**Format attendu :** `https://n8n.srv997159.hstgr.cloud/webhook`

**⚠️ Limitation :** Cette méthode suppose une structure d'URL fixe et est moins flexible.

### **Méthode 2 : Webhooks Spécifiques (Recommandé)** ✅
Les webhooks spécifiques sont **stockés dans la table `api_credentials`** (chiffrés) et configurés via l'interface Settings.

**Service Names à configurer :**
- `n8n_linkedin_scrape` - Scraping LinkedIn
- `n8n_ai_enrichment` - Enrichissement IA
- `n8n_email_send` - Envoi d'emails
- `n8n_email_reply` - Réponses emails
- `n8n_daily_detection` - Détection quotidienne
- `n8n_warmup` - Warm-up LinkedIn
- `n8n_connection` - Demandes de connexion
- `n8n_ai_conversation` - Conversations IA

**📋 URLs des Webhooks N8N (Récupérées via MCP) :**

| Service Name | Workflow N8N | Webhook Path | URL Complète | Workflow ID | Statut |
|--------------|--------------|--------------|--------------|-------------|--------|
| `n8n_linkedin_scrape` | LinkedIn Profile Scraper | `linkedin-scraper` | `https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper` | `bSH0ds0r0PEyxIsv` | ⚠️ Inactif |
| `n8n_ai_enrichment` | AI-Powered Contextual Enrichment | `ai-enrichment` | `https://n8n.srv997159.hstgr.cloud/webhook/ai-enrichment` | `DG6jPgRIP4KgrAKl` | ⚠️ Inactif |
| `n8n_email_reply` | AI Conversation Agent (Email) | `smtp/email-reply` | `https://n8n.srv997159.hstgr.cloud/webhook/smtp/email-reply` | `TZBWM2CaRWzUUPiS` | ⚠️ Inactif |
| `n8n_ai_conversation` | AI Conversation Agent (LinkedIn) | `unipil/linkedin-reply` | `https://n8n.srv997159.hstgr.cloud/webhook/unipil/linkedin-reply` | `TZBWM2CaRWzUUPiS` | ⚠️ Inactif |
| `n8n_meeting_booking` | Meeting Booking Webhook | `meeting-booking` | `https://n8n.srv997159.hstgr.cloud/webhook/meeting-booking` | `iwI4yZbkNXbYjrgj` | ⚠️ Inactif |
| `n8n_domain_verification` | Domain Verification | *(à configurer)* | `https://n8n.srv997159.hstgr.cloud/webhook/domain-verification` | `JFJ6dZZcm6CpXkVZ` | ⚠️ Inactif |

**⚠️ Note importante :** Tous les workflows sont actuellement **inactifs** dans N8N. Vous devez :
1. Activer chaque workflow dans N8N (toggle en haut à droite)
2. Vérifier que les paths des webhooks sont corrects
3. Copier l'URL complète depuis le node Webhook dans N8N
4. Configurer chaque webhook dans Sales Machine → Settings → API Credentials

**Avantages :**
- ✅ Webhooks différents par utilisateur
- ✅ Configuration dynamique sans redéploiement
- ✅ Gestion centralisée via l'interface Settings
- ✅ Chiffrement des URLs sensibles

**Comment configurer :**
1. Aller sur: https://app.n8n.cloud
2. Pour chaque workflow, créer un **Webhook Trigger Node**
3. Copier l'**URL complète du webhook** (ex: `https://n8n.srv997159.hstgr.cloud/webhook/abc-def-123`)
4. Aller dans Sales Machine → Settings → API Credentials
5. Ajouter chaque webhook avec le bon `service_name`

**🔗 Où trouver ces valeurs:**
- Dashboard N8N Cloud: https://app.n8n.cloud
- Pour chaque workflow : Ouvrir le workflow → Cliquer sur le node "Webhook" → Copier l'URL complète

**📝 Recommandation :** Utilisez la **Méthode 2** (webhooks spécifiques via Settings) pour plus de flexibilité. La variable `N8N_WEBHOOK_URL` peut être laissée vide si tous les webhooks sont configurés via Settings.

---

## 🤖 Claude API (Anthropic) - Configuration IA

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `CLAUDE_API_KEY` | Clé API Anthropic | `sk-ant-xxx...` | ❌ Optionnel* |
| `ANTHROPIC_API_KEY` | Alias pour CLAUDE_API_KEY | `sk-ant-xxx...` | ❌ Optionnel* |
| `CLAUDE_MODEL` | Modèle Claude à utiliser | `claude-sonnet-4-20250514` (défaut) | ❌ Optionnel |

**📝 Note:** *Les clés API Claude sont généralement stockées dans la table `api_credentials` (service_name: `openai`) et configurées via l'interface Settings. La variable d'environnement est utilisée comme fallback ou pour les tests.

**🔗 Où trouver ces valeurs:**
- Dashboard Anthropic: https://console.anthropic.com
- API Keys → Créer une nouvelle clé

**🌐 URL de l'API:**
- Base URL: `https://api.anthropic.com/v1`
- Endpoint Messages: `https://api.anthropic.com/v1/messages`

---

## 🔗 Unipile API - Configuration LinkedIn Automation

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `UNIPIL_API_KEY` | Clé API Unipile | `xxx` | ❌ Optionnel* |
| `UNIPIL_API_URL` | URL de base de l'API UniPil | `https://1api21.unipile.com:15176/api/v1/accounts` (défaut)<br>`https://api.unipil.com` (alternative) | ❌ Optionnel |

**📝 Note:** *Les clés API Unipile sont généralement stockées dans la table `api_credentials` (service_name: `unipil`) et configurées via l'interface Settings. La variable d'environnement est utilisée comme fallback.

**🔗 Où trouver ces valeurs:**
- Dashboard Unipile: https://unipile.com

## 🔍 Tavily API - Search & Extract

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `TAVILY_API_KEY` | Clé API Tavily (Search/Extract) | `tvly-xxx...` | ❌ Optionnel* |

**📝 Note:** *Clé stockée côté backend (`EMAIL_FINDER_API_KEY`, `TAVILY_API_KEY`) pour lancer les enrichissements depuis N8N. Override via Settings si besoin multi-comptes.

**🔗 Où trouver ces valeurs:**
- Dashboard Tavily: https://docs.tavily.com/documentation/api-reference/endpoint/search

---

## 📧 SMTP - Configuration Email

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `MAILGUN_API_KEY` | Clé API Mailgun | `xxx` | ❌ Optionnel* |
| `MAILGUN_DOMAIN` | Domaine Mailgun | `mg.example.com` | ❌ Optionnel* |
| `MAILGUN_API_URL` | URL de l'API Mailgun | `https://api.eu.mailgun.net/v3` (défaut EU)<br>`https://api.mailgun.net/v3` (US) | ❌ Optionnel |
| `SMTP_FROM_EMAIL` | Email expéditeur par défaut | `noreply@sales-machine.com` | ❌ Optionnel |
| `SYSTEM_EMAIL` | Email système pour notifications | `noreply@sales-machine.com` | ❌ Optionnel |

**📝 Note:** *Les credentials SMTP (Mailgun, SendGrid, AWS SES) sont généralement stockés dans la table `api_credentials` (service_name: `smtp_mailgun`, `smtp_sendgrid`, `smtp_ses`) et configurés via l'interface Settings.

**🔗 Où trouver ces valeurs:**
- Mailgun: https://app.mailgun.com → Settings → API Keys
- SendGrid: https://app.sendgrid.com → Settings → API Keys
- AWS SES: https://console.aws.amazon.com/ses → SMTP Settings

**🌐 URLs de l'API:**
- Mailgun EU: `https://api.eu.mailgun.net/v3`
- Mailgun US: `https://api.mailgun.net/v3`
- SendGrid: `https://api.sendgrid.com/v3`
- AWS SES: Variable selon la région

---

## 📅 Cal.com / Calendly - Configuration Réservation

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `CAL_COM_API_KEY` | Clé API Cal.com | `xxx` | ❌ Optionnel* |
| `CAL_COM_BASE_URL` | URL de base Cal.com | `https://api.cal.com/v1` (défaut) | ❌ Optionnel |
| `CAL_COM_API_URL` | Alias pour CAL_COM_BASE_URL | `https://api.cal.com/v1` | ❌ Optionnel |
| `CAL_COM_USERNAME` | Nom d'utilisateur Cal.com | `default` | ❌ Optionnel |
| `CAL_COM_OAUTH_CLIENT_ID` | Client ID OAuth Cal.com | `xxx` | ❌ Optionnel |
| `CAL_COM_OAUTH_CLIENT_SECRET` | Client Secret OAuth Cal.com | `xxx` | ❌ Optionnel |
| `CAL_COM_OAUTH_REDIRECT_URI` | URI de redirection OAuth | `https://app.sales-machine.com/onboarding/callback` | ❌ Optionnel |
| `CALENDLY_OAUTH_CLIENT_ID` | Client ID OAuth Calendly | `xxx` | ❌ Optionnel |
| `CALENDLY_OAUTH_CLIENT_SECRET` | Client Secret OAuth Calendly | `xxx` | ❌ Optionnel |
| `CALENDLY_OAUTH_REDIRECT_URI` | URI de redirection OAuth | `https://app.sales-machine.com/onboarding/callback` | ❌ Optionnel |

**📝 Note:** *Les credentials Cal.com/Calendly sont généralement stockés dans la table `api_credentials` (service_name: `cal_com`, `calendly`) et configurés via l'interface Settings.

**🔗 Où trouver ces valeurs:**
- Cal.com: https://cal.com → Settings → API → Create API Key
- Calendly: https://calendly.com/integrations/api → OAuth Apps

**🌐 URLs de l'API:**
- Cal.com: `https://api.cal.com/v1`
- Calendly: `https://api.calendly.com`
- Calendly OAuth: `https://auth.calendly.com/oauth/authorize` et `https://auth.calendly.com/oauth/token`

---

## 📅 Google Calendar / Outlook - Configuration Calendrier

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `GOOGLE_CLIENT_ID` | Client ID OAuth Google | `xxx.apps.googleusercontent.com` | ❌ Optionnel |
| `GOOGLE_CLIENT_SECRET` | Client Secret OAuth Google | `xxx` | ❌ Optionnel |
| `OUTLOOK_CLIENT_ID` | Client ID OAuth Microsoft | `xxx` | ❌ Optionnel |
| `OUTLOOK_CLIENT_SECRET` | Client Secret OAuth Microsoft | `xxx` | ❌ Optionnel |
| `CALENDAR_OAUTH_REDIRECT_URI` | URI de redirection OAuth | `https://app.sales-machine.com/onboarding/callback` | ❌ Optionnel |

**🔗 Où trouver ces valeurs:**
- Google: https://console.cloud.google.com → APIs & Services → Credentials
- Microsoft: https://portal.azure.com → App registrations

**🌐 URLs OAuth:**
- Google: `https://accounts.google.com/o/oauth2/v2/auth` et `https://oauth2.googleapis.com/token`
- Microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` et `https://login.microsoftonline.com/common/oauth2/v2.0/token`

---

## 📊 Monitoring & Alerting

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `SENTRY_DSN` | Sentry DSN pour le backend | `https://xxx@sentry.io/xxx` | ❌ Optionnel |
| `SENTRY_DSN_FRONTEND` | Sentry DSN pour le frontend | `https://xxx@sentry.io/xxx` | ❌ Optionnel |
| `SENTRY_ENVIRONMENT` | Environnement Sentry | `development` \| `staging` \| `production` | ❌ Optionnel |
| `SLACK_WEBHOOK_URL` | Webhook Slack pour alertes | `https://hooks.slack.com/services/xxx/xxx/xxx` | ❌ Optionnel |
| `ADMIN_EMAIL` | Email admin pour rapports | `admin@sales-machine.com` | ❌ Optionnel |

**🔗 Où trouver ces valeurs:**
- Sentry: https://sentry.io → Settings → Projects → Client Keys (DSN)
- Slack: https://api.slack.com/apps → Incoming Webhooks → Create Webhook

---

## 🔐 Sécurité & Authentification

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `JWT_SECRET` | Secret pour JWT (si utilisé) | Généré avec: `openssl rand -base64 32` | ❌ Optionnel |
| `API_SERVICE_TOKEN` | Token pour authentification interne | Généré avec: `openssl rand -base64 32` | ❌ Optionnel |

---

## 🌐 URLs d'API Externes - Référence

### Anthropic (Claude API)
- **Base URL:** `https://api.anthropic.com/v1`
- **Messages Endpoint:** `https://api.anthropic.com/v1/messages`
- **Documentation:** https://docs.anthropic.com

### UniPil API
- **Base URL (défaut):** `https://1api21.unipile.com:15176/api/v1/accounts`
- **Base URL (alternative):** `https://api.unipil.com`
- **Endpoints:**
  - `/linkedin/search` - Recherche de profils LinkedIn
  - `/linkedin/company/{url}` - Extraction de page entreprise
  - `/linkedin/like` - Like de post
  - `/linkedin/comment` - Commentaire sur post
  - `/linkedin/connection-request` - Demande de connexion
  - `/linkedin/message` - Envoi de message
  - `/api/v1/health` - Health check

### Cal.com API
- **Base URL:** `https://api.cal.com/v1`
- **Documentation:** https://cal.com/docs/api
- **OAuth:** `https://cal.com/api/auth/oauth`

### Calendly API
- **Base URL:** `https://api.calendly.com`
- **OAuth Auth:** `https://auth.calendly.com/oauth/authorize`
- **OAuth Token:** `https://auth.calendly.com/oauth/token`
- **Documentation:** https://developer.calendly.com/api-docs

### Google Calendar API
- **OAuth Auth:** `https://accounts.google.com/o/oauth2/v2/auth`
- **OAuth Token:** `https://oauth2.googleapis.com/token`
- **User Info:** `https://www.googleapis.com/oauth2/v2/userinfo`
- **Documentation:** https://developers.google.com/calendar/api

### Microsoft Outlook API
- **OAuth Auth:** `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- **OAuth Token:** `https://login.microsoftonline.com/common/oauth2/v2.0/token`
- **User Info:** `https://graph.microsoft.com/v1.0/me`
- **Documentation:** https://docs.microsoft.com/en-us/graph/api/overview

### Mailgun API
- **EU:** `https://api.eu.mailgun.net/v3`
- **US:** `https://api.mailgun.net/v3`
- **Documentation:** https://documentation.mailgun.com

### SendGrid API
- **Base URL:** `https://api.sendgrid.com/v3`
- **Documentation:** https://docs.sendgrid.com/api-reference

### Supabase
- **API URL:** `https://[PROJECT_ID].supabase.co`
- **Auth Callback:** `https://[PROJECT_ID].supabase.co/auth/v1/callback`
- **Documentation:** https://supabase.com/docs

### Upstash Redis
- **REST URL:** `https://[ENDPOINT].upstash.io`
- **Documentation:** https://docs.upstash.com/redis

### N8N Cloud
- **Base URL:** Variable selon l'instance (ex: `https://n8n.srv997159.hstgr.cloud`)
- **Webhook URL:** `https://[INSTANCE].hstgr.cloud/webhook/[WORKFLOW_ID]`
- **Documentation:** https://docs.n8n.io

---

## 📝 Notes Importantes

### Variables Stockées dans la Base de Données

Les clés API suivantes sont **stockées dans la table `api_credentials`** (chiffrées) et configurées via l'interface Settings, **pas** via les variables d'environnement:

- ✅ OpenAI/Claude API Key (`service_name: 'openai'`)
- ✅ UniPil API Key (`service_name: 'unipil'`)
- ✅ Tavily API Key (`service_name: 'tavily'`)
- ✅ SMTP Credentials (`service_name: 'smtp_mailgun'`, `smtp_sendgrid`, `smtp_ses`)
- ✅ Cal.com/Calendly API Keys (`service_name: 'cal_com'`, `calendly`)
- ✅ N8N Webhook URLs (`service_name: 'n8n_*'`)
- ✅ Email Finder API Key (`service_name: 'email_finder'`)

**Avantages:**
- ✅ Support multi-utilisateur (chaque utilisateur a ses propres clés)
- ✅ Configuration dynamique sans redéploiement
- ✅ Chiffrement au repos
- ✅ Vérification et test via l'interface

### Variables d'Environnement comme Fallback

Certaines variables d'environnement sont utilisées comme **fallback** si les credentials ne sont pas trouvés dans la base de données:
- `CLAUDE_API_KEY` / `ANTHROPIC_API_KEY`
- `UNIPIL_API_KEY`
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`

### Sécurité

**⚠️ NE JAMAIS COMMITER:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY`
- `JWT_SECRET`
- `API_SERVICE_TOKEN`
- Toutes les clés API (`*_API_KEY`, `*_CLIENT_SECRET`)

**✅ Utiliser:**
- `.env` dans `.gitignore`
- Variables d'environnement dans Railway/Vercel
- Secrets management pour la production

---

## 🚀 Déploiement

### Railway (Backend API)
1. Aller dans Railway Dashboard → Project → Variables
2. Ajouter toutes les variables "Requis" ci-dessus
3. Railway redémarre automatiquement après les changements

### Vercel/Netlify (Frontend)
1. Aller dans Vercel/Netlify Dashboard → Project → Environment Variables
2. Ajouter toutes les variables `VITE_*` ci-dessus
3. Redéployer après les changements

---

## 📚 Documentation Complémentaire

- [ENV_VARIABLES.md](../apps/api/ENV_VARIABLES.md) - Documentation détaillée API
- [dev-setup.md](./dev-setup.md) - Guide de setup développement
- [LINKS.md](../LINKS.md) - Liens importants du projet

---

**Dernière mise à jour:** 2025-01-17
**Maintenu par:** Product Owner (Sarah)

## ✉️ Enrow Email Finder

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `EMAIL_FINDER_API_KEY` | Clé API Enrow | `enrow-xxx-xxxx` | ❌ Optionnel* |

**📝 Note:** *Par défaut stockée dans `api_credentials` (service_name: `email_finder`). Utiliser la variable d'environnement pour initialiser l'instance ou fournir un fallback backend.*

**🔗 Où trouver ces valeurs:**
- Espace client Enrow

