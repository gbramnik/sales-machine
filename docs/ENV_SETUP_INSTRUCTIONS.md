# 📋 Instructions de Configuration des Variables d'Environnement

Guide rapide pour configurer les variables d'environnement de Sales Machine.

---

## 📚 Vue d'Ensemble des Services

Sales Machine utilise plusieurs services externes pour fonctionner. Voici un résumé rapide:

| Service | Utilité | Requis |
|---------|---------|--------|
| **Supabase** | Base de données PostgreSQL + Authentification | ✅ Oui |
| **Upstash Redis** | Cache + File d'attente emails | ✅ Oui |
| **N8N Cloud** | Automatisation workflows (scraping, enrichissement, emails) | ✅ Oui |
| **Claude API** | Intelligence Artificielle (messages, qualification) | ✅ Oui* |
| **UniPil API** | Automatisation LinkedIn (scraping, actions) | ✅ Oui* |
| **SMTP** (Mailgun/SendGrid) | Envoi d'emails transactionnels | ✅ Oui* |
| **Cal.com/Calendly** | Réservation de meetings | ❌ Optionnel |
| **Google Calendar/Outlook** | Synchronisation calendrier | ❌ Optionnel |
| **Sentry** | Monitoring erreurs | ❌ Optionnel |
| **Slack** | Alertes et notifications | ❌ Optionnel |

*⚠️ Généralement configuré via l'interface Settings (table `api_credentials`), mais peut être mis en variable d'environnement comme fallback.

---

## 📁 Fichiers à Créer

### 1. Backend API (`apps/api/.env`)

**📍 Emplacement:** `apps/api/.env`

**📋 Instructions:**
1. Copier le fichier `apps/api/.env.example` vers `apps/api/.env`
2. Remplir toutes les variables marquées comme **requises** (voir ci-dessous)
3. Les variables optionnelles peuvent être laissées vides si non utilisées

**Commandes:**
```bash
cd apps/api
cp .env.example .env
# Puis éditer .env avec vos valeurs
```

**✅ Variables Requises (Minimum):**
- `NODE_ENV`
- `PORT`
- `HOST`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_TOKEN`
- `N8N_WEBHOOK_URL` ⚠️ (URL de base, optionnel si webhooks configurés via Settings)

**📝 Note sur N8N_WEBHOOK_URL :** Cette variable est utilisée comme fallback. Il est **recommandé** de configurer les webhooks spécifiques via l'interface Settings (table `api_credentials`) avec les service_names `n8n_*`.

---

### 2. Frontend Web (`apps/web/.env.local`)

**📍 Emplacement:** `apps/web/.env.local`

**📋 Instructions:**
1. Copier le fichier `apps/web/.env.example` vers `apps/web/.env.local`
2. Remplir toutes les variables (toutes sont requises pour le frontend)

**Commandes:**
```bash
cd apps/web
cp .env.example .env.local
# Puis éditer .env.local avec vos valeurs
```

**✅ Variables Requises:**
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🔗 Où Récupérer les Valeurs

### 📊 Supabase - Base de Données PostgreSQL
**🎯 Utilité:** Base de données principale de l'application (PostgreSQL), gestion de l'authentification (OAuth), stockage de toutes les données (prospects, campagnes, utilisateurs, etc.)

**📋 Utilisation dans Sales Machine:**
- Stockage des prospects, campagnes, utilisateurs
- Authentification OAuth (Google, LinkedIn)
- Gestion des permissions (RLS - Row Level Security)
- Realtime pour les mises à jour en direct (Activity Stream)
- Storage pour les fichiers (futur)

1. Aller sur: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
2. Copier:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` et `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **SECRET!**

**💡 Astuce:** Le `SERVICE_ROLE_KEY` permet de bypasser les règles RLS et est nécessaire pour les opérations admin côté serveur.

---

### 🔴 Upstash Redis - Cache & Queue
**🎯 Utilité:** Cache Redis serverless pour le stockage temporaire, gestion des files d'attente (email queue), rate limiting, sessions utilisateur

**📋 Utilisation dans Sales Machine:**
- File d'attente des emails à envoyer (sorted set)
- Cache des enrichissements de prospects (7 jours TTL)
- Rate limiting (limitation du nombre de requêtes par utilisateur)
- Exclusion de prospects déjà contactés (cache 24h)
- Compteurs de warm-up LinkedIn (actions quotidiennes)

1. Aller sur: https://console.upstash.com
2. Créer une base Redis (ou utiliser existante)
3. Copier:
   - **REST URL** → `UPSTASH_REDIS_URL`
   - **REST Token** → `UPSTASH_REDIS_TOKEN`

**💡 Astuce:** Upstash est serverless et offre un tier gratuit généreux pour le développement.

---

### 🤖 N8N Cloud - Automatisation & Workflows

**📚 Documentation Complète :** Voir [N8N_WEBHOOKS_CONFIGURATION.md](./N8N_WEBHOOKS_CONFIGURATION.md) pour le guide détaillé.
**🎯 Utilité:** Plateforme d'automatisation workflow pour orchestrer les processus métier (scraping LinkedIn, enrichissement IA, envoi d'emails, etc.)

**📋 Utilisation dans Sales Machine:**
- Workflow de scraping LinkedIn (détection quotidienne de prospects)
- Workflow d'enrichissement IA (génération de talking points)
- Workflow d'envoi d'emails (file d'attente → SMTP)
- Workflow de warm-up LinkedIn (likes/comments automatisés)
- Workflow de réponse IA aux emails de prospects
- Webhooks pour déclencher les workflows depuis l'API

**⚙️ Configuration des Webhooks N8N:**

Il y a **deux méthodes** pour configurer les webhooks N8N :

#### **Méthode 1 : URL de Base (Fallback)** ⚠️
**Variable d'environnement :** `N8N_WEBHOOK_URL`

**Format :** `https://n8n.srv997159.hstgr.cloud/webhook`

Cette URL est utilisée comme **fallback** dans certains endroits du code où les webhooks sont construits dynamiquement avec des chemins :
- `/daily-detection/manual` → `{N8N_WEBHOOK_URL}/daily-detection/manual`
- `/ai-enrichment` → `{N8N_WEBHOOK_URL}/ai-enrichment`

**⚠️ Note:** Cette méthode est moins flexible car elle suppose une structure d'URL fixe.

#### **Méthode 2 : Webhooks Spécifiques (Recommandé)** ✅
**Stockage :** Table `api_credentials` (via interface Settings)

**Service Names :**
- `n8n_linkedin_scrape` - Scraping LinkedIn
- `n8n_ai_enrichment` - Enrichissement IA
- `n8n_email_send` - Envoi d'emails
- `n8n_email_reply` - Réponses emails
- `n8n_daily_detection` - Détection quotidienne
- `n8n_warmup` - Warm-up LinkedIn
- `n8n_connection` - Demandes de connexion
- `n8n_ai_conversation` - Conversations IA

**Comment configurer :**

#### **Option A : Script Automatique (Recommandé)** ✅

Utilisez le script TypeScript pour configurer automatiquement tous les webhooks :

```bash
# Depuis la racine du projet
npm run setup:n8n-webhooks <USER_ID>
```

**Exemple :**
```bash
npm run setup:n8n-webhooks eef4d199-1aec-468b-8c38-95b4c8e77352
```

Le script configure automatiquement les 6 webhooks N8N dans la table `api_credentials`.

📚 **Documentation complète :** Voir [N8N_WEBHOOKS_SETUP.md](./N8N_WEBHOOKS_SETUP.md)

#### **Option B : Configuration Manuelle** 📝

1. Aller sur: https://app.n8n.cloud
2. Pour chaque workflow, créer un **Webhook Trigger Node**
3. Copier l'**URL complète du webhook** (ex: `https://n8n.srv997159.hstgr.cloud/webhook/abc-def-123`)
4. Aller dans Sales Machine → Settings → API Credentials
5. Ajouter chaque webhook avec le bon `service_name`

#### **Option C : Script SQL** 📄

Utilisez le script SQL fourni : `scripts/setup-n8n-webhooks.sql`

**💡 Astuce:** Cette méthode est recommandée car elle permet :
- ✅ Webhooks différents par utilisateur
- ✅ Configuration dynamique sans redéploiement
- ✅ Gestion centralisée via l'interface Settings
- ✅ Chiffrement des URLs sensibles

**Exemple de configuration :**
```
Service Name: n8n_linkedin_scrape
Webhook URL: https://n8n.srv997159.hstgr.cloud/webhook/abc-def-ghi-123
```

**📋 Liste des Workflows N8N :**

| Workflow | Service Name | Description |
|----------|--------------|-------------|
| LinkedIn Scraper | `n8n_linkedin_scrape` | Scraping de profils LinkedIn |
| AI Enrichment | `n8n_ai_enrichment` | Enrichissement IA des prospects |
| Email Scheduler | `n8n_email_send` | Envoi d'emails programmé |
| Email Reply Handler | `n8n_email_reply` | Traitement des réponses emails |
| Daily Prospect Detection | `n8n_daily_detection` | Détection quotidienne de prospects |
| LinkedIn Warm-up | `n8n_warmup` | Actions de warm-up LinkedIn |
| Connection Trigger | `n8n_connection` | Déclenchement de connexions |
| AI Conversation | `n8n_ai_conversation` | Conversations IA avec prospects |

**🔗 Où trouver les webhooks :**
1. Aller sur: https://app.n8n.cloud
2. Ouvrir chaque workflow
3. Cliquer sur le node "Webhook"
4. Copier l'URL complète affichée (ex: `https://n8n.srv997159.hstgr.cloud/webhook/...`)

**💡 Astuce:** N8N permet de créer des workflows visuels sans code, idéal pour l'orchestration des processus complexes.

---

### 🧠 Claude API (Anthropic) - Intelligence Artificielle
**🎯 Utilité:** Modèle de langage IA pour générer des messages personnalisés, qualifier les prospects, répondre aux emails, enrichir les profils

**📋 Utilisation dans Sales Machine:**
- Enrichissement des prospects (génération de talking points basés sur le profil LinkedIn)
- Qualification des leads (BANT - Budget, Authority, Need, Timeline)
- Réponses automatiques aux emails de prospects
- Génération de messages de connexion LinkedIn personnalisés
- Analyse de sentiment des réponses de prospects

1. Aller sur: https://console.anthropic.com
2. Créer une clé API
3. Copier:
   - **API Key** → `CLAUDE_API_KEY`
   - ⚠️ **Note:** Généralement stocké dans la table `api_credentials` via l'interface Settings

**💡 Astuce:** Claude Sonnet 4 est utilisé par défaut pour équilibrer qualité et coût. Les réponses sont enregistrées pour l'amélioration continue.

---

### 🔗 UniPil API - Automatisation LinkedIn
**🎯 Utilité:** Service d'automatisation LinkedIn pour scraper les profils, effectuer des actions (likes, comments, connexions, messages)

**📋 Utilisation dans Sales Machine:**
- Recherche de prospects LinkedIn (par industrie, job title, localisation)
- Extraction de données de profils LinkedIn
- Actions de warm-up (likes et comments sur les posts)
- Envoi de demandes de connexion LinkedIn
- Envoi de messages LinkedIn aux prospects

1. Aller sur: https://unipil.com
2. Créer une clé API
3. Copier:
   - **API Key** → `UNIPIL_API_KEY`
   - ⚠️ **Note:** Généralement stocké dans la table `api_credentials` via l'interface Settings

**💡 Astuce:** UniPil remplace PhantomBuster dans l'architecture. Respect des limites LinkedIn (20-40 actions/jour) pour éviter les restrictions de compte.

---

### 📧 SMTP Services (Mailgun/SendGrid/AWS SES) - Envoi d'Emails
**🎯 Utilité:** Service d'envoi d'emails transactionnels avec gestion de la délivrabilité (SPF, DKIM, DMARC), tracking des bounces et spam complaints

**📋 Utilisation dans Sales Machine:**
- Envoi d'emails de prospection personnalisés
- Suivi de la délivrabilité (bounce rate, spam rate)
- Warm-up de domaine (progression graduelle du volume)
- Notifications utilisateur (nouvelles prospects, meetings bookés)
- Gestion des réponses d'emails (webhooks)

**🔗 Où récupérer:**
- **Mailgun:** https://app.mailgun.com → Settings → API Keys
- **SendGrid:** https://app.sendgrid.com → Settings → API Keys
- **AWS SES:** https://console.aws.amazon.com/ses → SMTP Settings

**💡 Astuce:** Mailgun est recommandé pour l'Europe (serveurs EU). Le warm-up de domaine est essentiel pour maintenir une bonne délivrabilité.

---

### 📅 Cal.com / Calendly - Réservation de Meetings
**🎯 Utilité:** Service de réservation de créneaux pour permettre aux prospects de réserver des meetings directement depuis les emails/LinkedIn

**📋 Utilisation dans Sales Machine:**
- Génération de liens de réservation personnalisés
- Intégration avec Google Calendar/Outlook (via OAuth)
- Webhooks pour notifier quand un meeting est booké
- Pré-remplissage des informations prospect dans le meeting

**🔗 Où récupérer:**
- **Cal.com:** https://cal.com → Settings → API → Create API Key
- **Calendly:** https://calendly.com/integrations/api → OAuth Apps

**💡 Astuce:** Cal.com est open-source et peut être self-hosted. Calendly est plus simple mais payant à grande échelle.

---

### 📅 Google Calendar / Microsoft Outlook - Calendriers
**🎯 Utilité:** Services de calendrier pour synchroniser les créneaux disponibles et gérer les meetings bookés

**📋 Utilisation dans Sales Machine:**
- OAuth pour connecter le calendrier de l'utilisateur
- Vérification des créneaux disponibles
- Création automatique d'événements quand un meeting est booké
- Synchronisation bidirectionnelle (meetings créés dans Sales Machine → calendrier)

**🔗 Où récupérer:**
- **Google Calendar:** https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
- **Microsoft Outlook:** https://portal.azure.com → App registrations → New registration

**💡 Astuce:** Les credentials OAuth sont configurés dans Supabase pour l'authentification. Les scopes nécessaires sont automatiquement demandés lors de la connexion.

---

### 🔔 Sentry - Monitoring & Error Tracking
**🎯 Utilité:** Plateforme de monitoring d'erreurs et de performance pour détecter et résoudre les problèmes en production

**📋 Utilisation dans Sales Machine:**
- Tracking des erreurs frontend et backend
- Alertes en temps réel sur les erreurs critiques
- Performance monitoring (temps de réponse API)
- Rapports de crash avec stack traces

**🔗 Où récupérer:**
- **Sentry:** https://sentry.io → Settings → Projects → Client Keys (DSN)

**💡 Astuce:** Sentry offre un tier gratuit généreux. Configurer les alertes Slack pour être notifié immédiatement des erreurs critiques.

---

### 📢 Slack - Alertes & Notifications
**🎯 Utilité:** Plateforme de communication pour recevoir des alertes et notifications sur l'état de l'application

**📋 Utilisation dans Sales Machine:**
- Alertes de délivrabilité (bounce rate élevé, spam complaints)
- Notifications d'erreurs critiques (Sentry → Slack)
- Rapports quotidiens/hebdomadaires (métriques, coûts)
- Alertes de workflow N8N en échec

**🔗 Où récupérer:**
- **Slack:** https://api.slack.com/apps → Incoming Webhooks → Create Webhook

**💡 Astuce:** Configurer un canal dédié #sales-machine-alerts pour centraliser toutes les notifications.

---

## ⚠️ Variables Stockées dans la Base de Données

Les clés API suivantes sont **généralement stockées dans la table `api_credentials`** (chiffrées) et configurées via l'interface Settings, **pas** via les variables d'environnement:

- ✅ OpenAI/Claude API Key
- ✅ UniPil API Key
- ✅ Tavily API Key
- ✅ SMTP Credentials (Mailgun, SendGrid, AWS SES)
- ✅ Cal.com/Calendly API Keys
- ✅ N8N Webhook URLs (spécifiques)
- ✅ Email Finder API Key

**Les variables d'environnement servent de fallback** si les credentials ne sont pas trouvés dans la base de données.

---

## 🔐 Sécurité

### ⚠️ NE JAMAIS COMMITER:
- `apps/api/.env`
- `apps/web/.env.local`
- Toutes les clés avec `*_KEY`, `*_SECRET`, `*_TOKEN`

### ✅ Fichiers Sécurisés (déjà dans .gitignore):
- `.env`
- `.env.local`
- `.env.*.local`

### ✅ Fichiers à Commiter:
- `.env.example` (sans valeurs sensibles)

---

## 🚀 Vérification

### Backend
```bash
cd apps/api
npm run dev
# Vérifier que le serveur démarre sans erreur
```

### Frontend
```bash
cd apps/web
npm run dev
# Vérifier que l'application se charge
```

### Test de Connexion
```bash
# Backend health check
curl http://localhost:3000/health

# Devrait retourner:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## 📚 Documentation Complète

Pour la liste complète de toutes les variables d'environnement et URLs d'API, voir:
- **[ENVIRONMENT_VARIABLES_REFERENCE.md](./ENVIRONMENT_VARIABLES_REFERENCE.md)** - Référence complète

---

## 🆘 Dépannage

### Erreur: "Missing environment variable"
- Vérifier que le fichier `.env` ou `.env.local` existe
- Vérifier que toutes les variables requises sont définies
- Redémarrer le serveur après modification

### Erreur: "Invalid Supabase credentials"
- Vérifier que `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont corrects
- Vérifier que le projet Supabase est actif (pas en pause)

### Erreur: "Redis connection failed"
- Vérifier que `UPSTASH_REDIS_URL` et `UPSTASH_REDIS_TOKEN` sont corrects
- Vérifier que la base Redis est active dans Upstash

---

**Dernière mise à jour:** 2025-01-17

