# 🚀 Plan de Déploiement - Sales Machine
## De la Maquette à l'Application Fonctionnelle

**État Actuel:** ✅ UI complète + animations + Dashboard mockup  
**Objectif:** 🎯 Dashboard actionnable avec vraies intégrations API

---

## 📊 Où en sommes-nous ?

### ✅ **TERMINÉ** (Epics 5 partiels + Design)
- [x] Landing page avec animations Framer Motion
- [x] Onboarding wizard (5 steps UI)
- [x] Dashboard mockup avec product showcases
- [x] Review Queue UI
- [x] Design system complet (Tailwind + custom tokens)
- [x] Base de données Supabase (42 tables créées)
- [x] Architecture monorepo documentée

### 🔄 **EN COURS** (Epic 1 - Fondation)
**Story 1.1:** Project Infrastructure (70% complete)
- [x] Monorepo structure
- [x] Supabase project configured
- [x] Tables schema deployed
- [ ] N8N workflows deployment
- [ ] Railway API Gateway setup
- [ ] CI/CD pipeline

### ⏳ **À FAIRE** (Epic 1 prioritaire)
**Story 1.2-1.8:** Core automation workflows
- [ ] LinkedIn scraping (PhantomBuster + N8N)
- [ ] AI enrichment (Claude API)
- [ ] Email campaigns (Instantly.ai/Smartlead)
- [ ] AI conversational agent
- [ ] Meeting booking (Cal.com/Calendly)
- [ ] Basic reporting

---

## 🎯 Plan de Déploiement en 3 Phases

### **PHASE 1: Admin Panel & API Core** (Semaine 1-2)
**Objectif:** Rendre le dashboard actionnable avec vraies données

#### 🔧 **1.1. Setup API Gateway (Railway)**
**Pourquoi d'abord?** Backend nécessaire pour tout le reste

**Tâches:**
1. **Deploy API sur Railway**
   ```bash
   cd apps/api
   railway init
   railway up
   ```
   - [ ] Configure environment variables (Supabase URL, keys)
   - [ ] Setup health check endpoint `/health`
   - [ ] Test API connectivity

2. **Créer endpoints Admin essentiels**
   ```typescript
   // apps/api/src/routes/admin/
   POST   /api/admin/campaigns/create
   GET    /api/admin/campaigns
   PATCH  /api/admin/campaigns/:id/status
   GET    /api/admin/dashboard/stats
   GET    /api/admin/prospects
   ```

3. **Auth Supabase integration**
   - [ ] JWT validation middleware
   - [ ] RLS policies on tables
   - [ ] Admin role check

**Livrable:** API fonctionnelle sur Railway avec Swagger docs

---

#### 📊 **1.2. Dashboard Admin Panel**
**Fichier à créer:** `apps/web/src/pages/AdminDashboard.tsx`

**Features:**
1. **Gestion Campaigns**
   ```typescript
   - Liste des campaigns (table avec status)
   - Bouton "Create Campaign" → Modal
   - Actions: Pause/Resume/Delete
   - Filtres: Status, Date, Agent
   ```

2. **Monitoring Real-Time**
   ```typescript
   - Health score (vraies données Supabase)
   - Prospects pipeline (Kanban avec vraies données)
   - AI activity stream (messages récents)
   - Metrics live (count depuis DB)
   ```

3. **Prospect Management**
   ```typescript
   - Liste prospects avec filters
   - Bulk actions (export, delete, tag)
   - Detail modal avec conversation history
   ```

**Composants à migrer:**
- Réutiliser `Dashboard.tsx` existant
- Connecter aux vrais endpoints
- Ajouter loading states + error handling

**Livrable:** Dashboard admin avec CRUD campagnes fonctionnel

---

#### ⚙️ **1.3. Settings / Config Panel**
**Fichier:** `apps/web/src/pages/Settings.tsx`

**Sections:**

1. **🔐 API Keys Management**
   ```typescript
   Interface pour stocker:
   - OpenAI API Key (pour AI enrichment)
   - PhantomBuster API Key (LinkedIn scraping)
   - Instantly.ai API Key (email sending)
   - Cal.com API Key (meeting booking)
   - N8N Webhook URLs
   ```

   **Table Supabase:** `api_credentials`
   ```sql
   CREATE TABLE api_credentials (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     service_name TEXT NOT NULL,
     api_key TEXT ENCRYPTED,
     webhook_url TEXT,
     is_active BOOLEAN DEFAULT true,
     last_verified_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. **🎯 ICP Configuration**
   ```typescript
   - Industries cibles
   - Job titles
   - Company size ranges
   - Geo locations
   - Technologies used (BuiltWith)
   ```

3. **📧 Email Settings**
   ```typescript
   - Domain verification status
   - Sending limits (20/day enforced)
   - Warm-up status
   - Bounce rate monitoring
   ```

4. **🤖 AI Agent Config**
   ```typescript
   - Personality selection
   - Tone & style
   - Response templates
   - Confidence threshold (80% default)
   ```

**Livrable:** Settings panel complet pour configuration

---

### **PHASE 2: N8N Workflows Integration** (Semaine 3-4)
**Objectif:** Automatiser LinkedIn scraping + AI enrichment + Email sending

#### 🔀 **2.1. N8N Cloud Setup**

**Workflows à créer:**

1. **Workflow 1: LinkedIn Scraping**
   ```
   Trigger: HTTP Webhook
   ↓
   PhantomBuster: Launch scraper
   ↓
   Wait: Poll for results
   ↓
   Parse: Extract profiles
   ↓
   Supabase: Insert into `prospects`
   ↓
   Response: Return prospect IDs
   ```

2. **Workflow 2: AI Enrichment**
   ```
   Trigger: Webhook (after scraping)
   ↓
   Loop: For each prospect
   ↓
   OpenAI: Generate talking points
   ↓
   Supabase: Insert `prospect_enrichment`
   ↓
   Redis (Upstash): Cache enrichment
   ```

3. **Workflow 3: Email Campaign Sender**
   ```
   Trigger: Cron (every hour)
   ↓
   Redis: Dequeue 20 emails
   ↓
   Instantly.ai: Send emails
   ↓
   Supabase: Update prospect status
   ↓
   Check: Bounce rate < 5%
   ```

4. **Workflow 4: Email Reply Handler**
   ```
   Trigger: Instantly.ai webhook
   ↓
   Extract: Reply content
   ↓
   OpenAI: Qualify lead + generate response
   ↓
   Decision: Confidence > 80%?
     YES → Send calendar link
     NO  → Queue for human review
   ↓
   Supabase: Log conversation
   ```

**Livrable:** 4 workflows N8N deployés sur cloud

---

#### 🎯 **2.2. Dashboard Actions Integration**

**Connecter UI aux workflows:**

1. **Button "Launch Campaign"**
   ```typescript
   // apps/web/src/components/dashboard/CampaignActions.tsx
   
   async function launchCampaign(campaignId: string) {
     // 1. Trigger LinkedIn scraping
     await fetch('/api/campaigns/:id/trigger-scrape', { method: 'POST' })
     
     // 2. Poll for scraping progress
     const interval = setInterval(async () => {
       const { status, count } = await fetch(`/api/campaigns/:id/progress`)
       if (status === 'complete') {
         // 3. Trigger AI enrichment
         await fetch('/api/campaigns/:id/trigger-enrichment', { method: 'POST' })
         clearInterval(interval)
       }
     }, 5000)
   }
   ```

2. **Real-Time Progress Tracking**
   ```typescript
   // Supabase Realtime subscription
   supabase
     .channel('campaign-progress')
     .on('postgres_changes', {
       event: 'UPDATE',
       schema: 'public',
       table: 'campaign_progress',
       filter: `campaign_id=eq.${campaignId}`
     }, (payload) => {
       updateProgress(payload.new)
     })
     .subscribe()
   ```

3. **AI Review Queue Actions**
   ```typescript
   // Approve/Edit/Reject buttons
   POST /api/ai-review-queue/:id/approve
   POST /api/ai-review-queue/:id/edit
   POST /api/ai-review-queue/:id/reject
   ```

**Livrable:** Dashboard avec actions réelles connectées aux workflows

---

### **PHASE 3: Production Readiness** (Semaine 5-6)
**Objectif:** Monitoring + Sécurité + Scale prep

#### 🔒 **3.1. Security & Compliance**

1. **API Keys Encryption**
   ```typescript
   // Use Supabase Vault for sensitive data
   import { vault } from '@supabase/supabase-js'
   
   await vault.createSecret('openai_key', process.env.OPENAI_KEY)
   ```

2. **RLS Policies**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users see only their campaigns"
   ON campaigns FOR SELECT
   USING (auth.uid() = user_id);
   ```

3. **Rate Limiting**
   ```typescript
   // Upstash Redis rate limiter
   import { Ratelimit } from '@upstash/ratelimit'
   
   const limiter = new Ratelimit({
     redis: upstash,
     limiter: Ratelimit.slidingWindow(100, '1 h')
   })
   ```

4. **GDPR Compliance**
   - [ ] Data export endpoint
   - [ ] Prospect deletion cascade
   - [ ] Privacy policy page
   - [ ] Cookie consent

---

#### 📈 **3.2. Monitoring & Alerts**

1. **Sentry Error Tracking**
   ```typescript
   import * as Sentry from '@sentry/react'
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: 'production'
   })
   ```

2. **Uptime Monitoring**
   - Railway health checks
   - Supabase connection monitoring
   - N8N workflow status

3. **Key Metrics Dashboard**
   ```typescript
   Metrics à tracker:
   - API response times
   - Workflow success rate
   - Email deliverability
   - AI confidence scores
   - Bounce rate real-time
   ```

4. **Alert Rules**
   ```
   - Bounce rate > 5% → Pause campaigns
   - API errors > 10/min → Notify admin
   - Workflow failure → Retry 3x then alert
   ```

**Livrable:** Production-ready avec monitoring

---

## 📋 Checklist Détaillée - Phase 1 (Prioritaire)

### **API Setup (2-3 jours)**
- [ ] Create Railway project
- [ ] Deploy API from `apps/api`
- [ ] Configure env vars (Supabase, JWT secret)
- [ ] Create health check `/health`
- [ ] Test API connectivity
- [ ] Setup CORS for frontend
- [ ] Generate Swagger docs

### **Admin Endpoints (3-4 jours)**
- [ ] `POST /api/admin/campaigns` - Create campaign
- [ ] `GET /api/admin/campaigns` - List campaigns
- [ ] `PATCH /api/admin/campaigns/:id` - Update status
- [ ] `DELETE /api/admin/campaigns/:id` - Delete campaign
- [ ] `GET /api/admin/prospects` - List with filters
- [ ] `GET /api/admin/dashboard/stats` - Real-time metrics
- [ ] `GET /api/admin/ai-review-queue` - Pending messages
- [ ] `POST /api/admin/ai-review-queue/:id/approve` - Approve
- [ ] Add Zod validation on all endpoints
- [ ] Add error handling middleware

### **Settings Panel (2-3 jours)**
- [ ] Create `api_credentials` table migration
- [ ] Settings UI with tabs (API Keys, ICP, Email, AI)
- [ ] API keys form with encryption
- [ ] Domain verification UI
- [ ] ICP configuration form
- [ ] Save settings endpoint
- [ ] Test credentials validation

### **Dashboard Connections (3-4 jours)**
- [ ] Replace mock data with API calls
- [ ] Add loading states (Skeleton UI)
- [ ] Error boundaries
- [ ] Real-time subscriptions (Supabase Realtime)
- [ ] Campaign CRUD UI
- [ ] Prospect filters & search
- [ ] AI Review Queue actions
- [ ] Toast notifications

---

## 🔑 Variables d'Environnement Nécessaires

### **Backend (Railway)**
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_KEY=eyJxxx

# Upstash Redis
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=Axxx

# N8N
N8N_WEBHOOK_LINKEDIN_SCRAPE=https://n8n.cloud/webhook/xxx
N8N_WEBHOOK_AI_ENRICHMENT=https://n8n.cloud/webhook/xxx
N8N_WEBHOOK_EMAIL_SEND=https://n8n.cloud/webhook/xxx

# APIs (stored encrypted in Supabase Vault)
# OPENAI_API_KEY - via Settings UI
# PHANTOMBUSTER_API_KEY - via Settings UI
# INSTANTLY_API_KEY - via Settings UI
# CALENDLY_API_KEY - via Settings UI

# Security
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### **Frontend (Railway/Vercel)**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_API_BASE_URL=https://api-sales-machine.up.railway.app
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🎯 Success Metrics

### **Phase 1 (Admin Panel)**
- [ ] Dashboard loads real data in <2s
- [ ] Campaign creation works end-to-end
- [ ] API response time < 500ms p95
- [ ] Settings saved successfully

### **Phase 2 (N8N Integration)**
- [ ] LinkedIn scraping: 50 profiles in <5min
- [ ] AI enrichment: <3s per prospect
- [ ] Email sending: 20/hour automated
- [ ] AI reply: <5s response time

### **Phase 3 (Production)**
- [ ] Uptime > 99.5%
- [ ] Email deliverability > 92%
- [ ] Zero RLS breaches
- [ ] GDPR compliant

---

## 🚀 Prochaines Actions (Priorisation)

### **IMMEDIATE (Cette semaine)**
1. ✅ Deploy API Gateway sur Railway
2. ✅ Create Settings panel pour API keys
3. ✅ Connect Dashboard aux vraies données Supabase

### **SHORT-TERM (Semaine prochaine)**
4. ⏳ Deploy N8N LinkedIn scraping workflow
5. ⏳ Deploy AI enrichment workflow
6. ⏳ Test campaign end-to-end

### **MEDIUM-TERM (2 semaines)**
7. ⏳ Email campaign automation
8. ⏳ AI agent reply handling
9. ⏳ Meeting booking integration

---

## 📞 **Tu veux qu'on commence par quoi ?**

**Options recommandées:**

**A) 🔧 Backend First (Recommandé)**
→ Deploy Railway API + Settings panel
→ 2-3 jours, rend tout le reste possible

**B) 📊 Dashboard Actions**
→ Connecter UI aux données Supabase
→ 2 jours, donne satisfaction immédiate

**C) 🔀 N8N Workflows**
→ LinkedIn scraping automation
→ 3-4 jours, automatisation concrète

**Quelle approche préfères-tu ?** 🎯



