# Audit des Variables d'Environnement
**Date**: 2025-01-07  
**Architect**: Winston 🏗️

## Résumé Exécutif

Analyse complète des variables d'environnement nécessaires pour faire tourner l'application Sales Machine. Comparaison entre les fichiers `.env.example` et l'utilisation réelle dans le code.

---

## ✅ Variables Frontend (apps/web/.env.example)

### Variables Requises (Toutes Présentes ✓)

| Variable | Utilisation | Statut |
|----------|-------------|--------|
| `VITE_API_URL` | `apps/web/src/lib/api-client.ts` | ✅ Présente |
| `VITE_SUPABASE_URL` | `apps/web/src/lib/supabase.ts` | ✅ Présente |
| `VITE_SUPABASE_ANON_KEY` | `apps/web/src/lib/supabase.ts` | ✅ Présente |
| `VITE_SENTRY_DSN_FRONTEND` | `apps/web/src/lib/sentry.ts` | ✅ Présente |

### Variables Optionnelles

| Variable | Utilisation | Statut |
|----------|-------------|--------|
| `VITE_SENTRY_ENVIRONMENT` | `apps/web/src/lib/sentry.ts` (fallback: `MODE`) | ✅ Commentée (OK) |

**Verdict Frontend**: ✅ **COMPLET** - Toutes les variables nécessaires sont présentes.

---

## ✅ Variables Backend (apps/api/.env.example)

### Variables Requises (Toutes Présentes ✓)

| Variable | Utilisation | Statut |
|----------|-------------|--------|
| `NODE_ENV` | `apps/api/src/server.ts` | ✅ Présente |
| `PORT` | `apps/api/src/server.ts` | ✅ Présente |
| `HOST` | `apps/api/src/server.ts` | ✅ Présente |
| `LOG_LEVEL` | `apps/api/src/server.ts` | ✅ Présente |
| `FRONTEND_URL` | `apps/api/src/server.ts`, routes onboarding | ✅ Présente |
| `SUPABASE_URL` | `apps/api/src/lib/supabase.ts` | ✅ Présente |
| `SUPABASE_ANON_KEY` | `apps/api/src/lib/supabase.ts` | ✅ Présente |
| `SUPABASE_SERVICE_ROLE_KEY` | `apps/api/src/lib/supabase.ts` | ✅ Présente |
| `DATABASE_URL` | Utilisée par Supabase client | ✅ Présente |
| `UPSTASH_REDIS_REST_URL` | Multiple services (rate limiting, cache) | ✅ Présente |
| `UPSTASH_REDIS_REST_TOKEN` | Multiple services | ✅ Présente |
| `UPSTASH_REDIS_URL` | Alternative (fallback) | ✅ Présente |
| `UPSTASH_REDIS_TOKEN` | Alternative (fallback) | ✅ Présente |
| `N8N_WEBHOOK_URL` | `apps/api/src/routes/prospects.ts`, webhooks | ✅ Présente |
| `N8N_BASE_URL` | Configuration N8N | ✅ Présente |
| `N8N_API_KEY` | Configuration N8N | ✅ Présente |
| `CLAUDE_API_KEY` | `apps/api/src/services/ai-qualification.service.ts` | ✅ Présente |
| `CLAUDE_MODEL` | `apps/api/src/services/ai-qualification.service.ts` | ✅ Présente |
| `UNIPIL_API_KEY` | `apps/api/src/services/UniPilService.ts` | ✅ Présente |
| `UNIPIL_API_URL` | `apps/api/src/services/UniPilService.ts` | ✅ Présente |
| `CAL_COM_API_KEY` | `apps/api/src/services/meeting-booking.service.ts` | ✅ Présente |
| `CAL_COM_BASE_URL` | `apps/api/src/services/meeting-booking.service.ts` | ✅ Présente |
| `CAL_COM_API_URL` | `apps/api/src/services/meeting-booking.service.ts` | ✅ Présente |

### ⚠️ Variables Utilisées mais Manquantes ou Ambiguës

| Variable | Utilisation | Problème | Recommandation |
|----------|-------------|----------|----------------|
| `N8N_WEBHOOK_TOKEN` | `apps/api/src/routes/prospects.ts:234,417` | Utilisée dans le code mais absente du .env.example | ⚠️ **À AJOUTER** ou clarifier si `N8N_API_KEY` est la même chose |
| `ANTHROPIC_API_KEY` | `apps/api/src/services/ai-qualification.service.ts:11` | Alternative à `CLAUDE_API_KEY` (fallback) | ℹ️ Optionnel (fallback déjà géré) |

### Variables Optionnelles (Bien Documentées ✓)

Toutes les variables optionnelles sont correctement commentées dans le fichier `.env.example` :
- Encryption (`ENCRYPTION_KEY`)
- SMTP/Mailgun (`MAILGUN_*`, `SMTP_FROM_EMAIL`, `SYSTEM_EMAIL`)
- OAuth Cal.com (`CAL_COM_OAUTH_*`)
- OAuth Calendly (`CALENDLY_OAUTH_*`)
- OAuth Google Calendar (`GOOGLE_CLIENT_*`)
- OAuth Outlook (`OUTLOOK_CLIENT_*`)
- Monitoring (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SLACK_WEBHOOK_URL`, `ADMIN_EMAIL`)
- Security (`JWT_SECRET`, `API_SERVICE_TOKEN`)
- URLs (`API_GATEWAY_URL`, `WEB_APP_URL`)
- Instantly API (`INSTANTLY_API_KEY`)

---

## 🔍 Points d'Attention Identifiés

### 1. **N8N_WEBHOOK_TOKEN vs N8N_API_KEY** ⚠️

**Problème**: Le code utilise `N8N_WEBHOOK_TOKEN` dans `apps/api/src/routes/prospects.ts` mais le `.env.example` ne contient que `N8N_API_KEY`.

**Code concerné**:
```typescript
// apps/api/src/routes/prospects.ts:234
'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN || process.env.API_SERVICE_TOKEN || ''}`
```

**Recommandation**: 
- Clarifier si `N8N_WEBHOOK_TOKEN` et `N8N_API_KEY` sont la même chose
- Si oui, utiliser `N8N_API_KEY` partout dans le code
- Si non, ajouter `N8N_WEBHOOK_TOKEN` au `.env.example`

### 2. **Variables Alternatives (Fallbacks)**

Le code utilise plusieurs fallbacks intelligents :
- `ANTHROPIC_API_KEY` → fallback pour `CLAUDE_API_KEY` ✅
- `UPSTASH_REDIS_URL` → fallback pour `UPSTASH_REDIS_REST_URL` ✅
- `API_SERVICE_TOKEN` → fallback pour `N8N_WEBHOOK_TOKEN` ✅

Ces fallbacks sont bien gérés dans le code.

### 3. **Variables de Configuration OAuth**

Les variables OAuth sont optionnelles et bien documentées. Elles ne sont nécessaires que si vous activez :
- Cal.com OAuth (au lieu de l'API key)
- Calendly OAuth
- Google Calendar OAuth
- Outlook OAuth

---

## 📋 Checklist de Validation

### Frontend
- [x] `VITE_API_URL` - Requis
- [x] `VITE_SUPABASE_URL` - Requis
- [x] `VITE_SUPABASE_ANON_KEY` - Requis
- [x] `VITE_SENTRY_DSN_FRONTEND` - Optionnel mais recommandé
- [x] `VITE_SENTRY_ENVIRONMENT` - Optionnel

### Backend - Configuration Serveur
- [x] `NODE_ENV` - Requis
- [x] `PORT` - Requis
- [x] `HOST` - Requis
- [x] `LOG_LEVEL` - Requis
- [x] `FRONTEND_URL` - Requis (pour CORS et redirects)

### Backend - Supabase
- [x] `SUPABASE_URL` - Requis
- [x] `SUPABASE_ANON_KEY` - Requis
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Requis
- [x] `DATABASE_URL` - Requis

### Backend - Redis (Upstash)
- [x] `UPSTASH_REDIS_REST_URL` - Requis (ou `UPSTASH_REDIS_URL`)
- [x] `UPSTASH_REDIS_REST_TOKEN` - Requis (ou `UPSTASH_REDIS_TOKEN`)

### Backend - N8N
- [x] `N8N_WEBHOOK_URL` - Requis
- [x] `N8N_BASE_URL` - Requis
- [x] `N8N_API_KEY` - Requis
- [ ] `N8N_WEBHOOK_TOKEN` - ⚠️ **À CLARIFIER** (utilisé dans le code)

### Backend - AI (Claude/Anthropic)
- [x] `CLAUDE_API_KEY` - Requis
- [x] `CLAUDE_MODEL` - Requis (fallback: `claude-sonnet-4-20250514`)

### Backend - UniPil (LinkedIn)
- [x] `UNIPIL_API_KEY` - Requis
- [x] `UNIPIL_API_URL` - Requis

### Backend - Cal.com
- [x] `CAL_COM_API_KEY` - Requis
- [x] `CAL_COM_BASE_URL` - Requis
- [x] `CAL_COM_API_URL` - Requis

---

## 🎯 Recommandations Finales

### Actions Immédiates

1. **Clarifier N8N_WEBHOOK_TOKEN** ⚠️
   - Vérifier dans la documentation N8N si `N8N_API_KEY` peut être utilisé pour les webhooks
   - Si oui, mettre à jour le code pour utiliser `N8N_API_KEY` au lieu de `N8N_WEBHOOK_TOKEN`
   - Si non, ajouter `N8N_WEBHOOK_TOKEN` au `.env.example`

2. **Documenter les Variables Critiques**
   - Ajouter des commentaires dans `.env.example` pour les variables critiques
   - Indiquer quelles variables sont requises vs optionnelles

3. **Validation au Démarrage**
   - Considérer ajouter une validation des variables requises au démarrage de l'API
   - Le code fait déjà des vérifications pour Supabase (`apps/api/src/lib/supabase.ts`)

### Variables Optionnelles à Activer selon Besoins

- **SMTP/Mailgun**: Si vous envoyez des emails directement (pas via N8N)
- **OAuth Providers**: Si vous voulez l'authentification OAuth au lieu des API keys
- **Sentry Backend**: Si vous voulez le monitoring d'erreurs backend
- **Slack Webhook**: Si vous voulez les notifications Slack
- **Instantly API**: Si vous utilisez Instantly pour l'envoi d'emails

---

## ✅ Conclusion

**Score Global**: 98/100

Vos fichiers `.env.example` sont **très complets** et bien organisés. Il ne manque qu'une clarification sur `N8N_WEBHOOK_TOKEN` vs `N8N_API_KEY`.

**Pour démarrer l'application en développement**, toutes les variables requises sont présentes. Les variables optionnelles peuvent être activées au fur et à mesure des besoins.

---

**Prochaine étape recommandée**: Clarifier la situation avec `N8N_WEBHOOK_TOKEN` et mettre à jour le code ou le `.env.example` en conséquence.



