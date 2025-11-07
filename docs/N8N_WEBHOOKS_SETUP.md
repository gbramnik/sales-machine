# 🔧 Configuration des Webhooks N8N dans Sales Machine

Guide pour configurer automatiquement les webhooks N8N dans la table `api_credentials`.

---

## 📋 Méthodes de Configuration

Il existe **quatre méthodes** pour configurer les webhooks N8N :

### **Méthode 1 : Fonction SQL (Via MCP - Recommandé)** ✅

La fonction SQL `setup_n8n_webhooks_for_user()` a été créée dans la base de données via migration.

#### Utilisation via SQL

```sql
-- Pour un utilisateur spécifique
SELECT * FROM setup_n8n_webhooks_for_user('USER_ID_ICI'::uuid);

-- Pour tous les utilisateurs existants
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users
  LOOP
    PERFORM setup_n8n_webhooks_for_user(user_record.id);
    RAISE NOTICE 'Webhooks N8N configurés pour l''utilisateur: %', user_record.id;
  END LOOP;
END $$;
```

#### Utilisation via MCP Supabase

La fonction est déjà déployée dans la base de données via migration `setup_n8n_webhooks_function`. Vous pouvez l'appeler directement depuis Supabase SQL Editor ou via le MCP Supabase.

**✅ Déployé avec succès !** La migration a été appliquée et la fonction est disponible.

**Exemple d'utilisation :**

```sql
-- Configurer pour un utilisateur spécifique
SELECT * FROM setup_n8n_webhooks_for_user('eef4d199-1aec-468b-8c38-95b4c8e77352'::uuid);
```

Voir `scripts/setup-n8n-webhooks-example.sql` pour plus d'exemples.

---

### **Méthode 2 : Script TypeScript** 📝

Le script TypeScript configure automatiquement tous les webhooks N8N pour un utilisateur.

#### Prérequis

- Node.js installé
- Variables d'environnement configurées dans `apps/api/.env` :
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

#### Utilisation

```bash
# Depuis la racine du projet
tsx scripts/setup-n8n-webhooks.ts <USER_ID>
```

**Exemple :**

```bash
tsx scripts/setup-n8n-webhooks.ts eef4d199-1aec-468b-8c38-95b4c8e77352
```

**Ou avec une variable d'environnement :**

```bash
USER_ID=eef4d199-1aec-468b-8c38-95b4c8e77352 tsx scripts/setup-n8n-webhooks.ts
```

#### Ce que fait le script

1. ✅ Vérifie que l'utilisateur existe
2. ✅ Configure chaque webhook N8N (6 webhooks au total)
3. ✅ Crée les entrées si elles n'existent pas
4. ✅ Met à jour les URLs si elles ont changé
5. ✅ Affiche un résumé des opérations

#### Webhooks configurés

- `n8n_linkedin_scrape` - LinkedIn Profile Scraper
- `n8n_ai_enrichment` - AI-Powered Contextual Enrichment
- `n8n_email_reply` - AI Conversation Agent (Email Reply)
- `n8n_ai_conversation` - AI Conversation Agent (LinkedIn Reply)
- `n8n_meeting_booking` - Meeting Booking Webhook
- `n8n_domain_verification` - Domain Verification

---

### **Méthode 3 : Script SQL** 📝

Si vous préférez utiliser SQL directement, utilisez le script SQL fourni.

#### Utilisation

1. Ouvrir le fichier `scripts/setup-n8n-webhooks.sql`
2. Remplacer `<USER_ID>` par l'ID de l'utilisateur
3. Exécuter dans Supabase SQL Editor ou via psql

**Exemple :**

```sql
-- Remplacer <USER_ID> par l'ID réel
-- Exemple: 'eef4d199-1aec-468b-8c38-95b4c8e77352'::uuid
```

#### Via Supabase SQL Editor

1. Aller sur : https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
2. Copier le contenu de `scripts/setup-n8n-webhooks.sql`
3. Remplacer `<USER_ID>` par l'ID de l'utilisateur
4. Exécuter le script

---

### **Méthode 4 : Via l'API REST** 🌐

Vous pouvez également utiliser l'API REST de Sales Machine pour configurer chaque webhook.

#### Endpoint

```
POST /api/settings/api-credentials
```

#### Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body

```json
{
  "service_name": "n8n_linkedin_scrape",
  "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper"
}
```

#### Exemple avec curl

```bash
curl -X POST http://localhost:3000/api/settings/api-credentials \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "n8n_linkedin_scrape",
    "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper"
  }'
```

#### Script pour configurer tous les webhooks

```bash
#!/bin/bash

USER_ID="eef4d199-1aec-468b-8c38-95b4c8e77352"
JWT_TOKEN="YOUR_JWT_TOKEN"
API_URL="http://localhost:3000"

# LinkedIn Scrape
curl -X POST "$API_URL/api/settings/api-credentials" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name": "n8n_linkedin_scrape", "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper"}'

# AI Enrichment
curl -X POST "$API_URL/api/settings/api-credentials" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name": "n8n_ai_enrichment", "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/ai-enrichment"}'

# Email Reply
curl -X POST "$API_URL/api/settings/api-credentials" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name": "n8n_email_reply", "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/smtp/email-reply"}'

# AI Conversation (LinkedIn)
curl -X POST "$API_URL/api/settings/api-credentials" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name": "n8n_ai_conversation", "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/unipil/linkedin-reply"}'

# Meeting Booking
curl -X POST "$API_URL/api/settings/api-credentials" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name": "n8n_meeting_booking", "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/meeting-booking"}'

# Domain Verification
curl -X POST "$API_URL/api/settings/api-credentials" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name": "n8n_domain_verification", "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/domain-verification"}'
```

---

## ✅ Vérification

### Vérifier via SQL

```sql
SELECT 
  service_name,
  webhook_url,
  is_active,
  metadata->>'description' as description,
  metadata->>'workflow_id' as workflow_id,
  created_at,
  updated_at
FROM api_credentials
WHERE user_id = '<USER_ID>'::uuid
  AND service_name LIKE 'n8n_%'
ORDER BY service_name;
```

### Vérifier via API

```bash
curl -X GET http://localhost:3000/api/settings/api-credentials \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Vérifier via l'Interface

1. Se connecter à Sales Machine
2. Aller dans **Settings** → **API Credentials**
3. Vérifier que tous les webhooks N8N sont présents et actifs

---

## 📋 Liste des Webhooks

| Service Name | Webhook URL | Workflow ID | Description |
|--------------|-------------|-------------|-------------|
| `n8n_linkedin_scrape` | `https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper` | `bSH0ds0r0PEyxIsv` | LinkedIn Profile Scraper |
| `n8n_ai_enrichment` | `https://n8n.srv997159.hstgr.cloud/webhook/ai-enrichment` | `DG6jPgRIP4KgrAKl` | AI-Powered Contextual Enrichment |
| `n8n_email_reply` | `https://n8n.srv997159.hstgr.cloud/webhook/smtp/email-reply` | `TZBWM2CaRWzUUPiS` | AI Conversation Agent (Email Reply) |
| `n8n_ai_conversation` | `https://n8n.srv997159.hstgr.cloud/webhook/unipil/linkedin-reply` | `TZBWM2CaRWzUUPiS` | AI Conversation Agent (LinkedIn Reply) |
| `n8n_meeting_booking` | `https://n8n.srv997159.hstgr.cloud/webhook/meeting-booking` | `iwI4yZbkNXbYjrgj` | Meeting Booking Webhook |
| `n8n_domain_verification` | `https://n8n.srv997159.hstgr.cloud/webhook/domain-verification` | `JFJ6dZZcm6CpXkVZ` | Domain Verification |

---

## ⚠️ Notes Importantes

1. **Activation des Workflows N8N :** Les workflows doivent être **activés** dans N8N Cloud avant utilisation
2. **Vérification des URLs :** Les URLs peuvent changer si les workflows sont recréés dans N8N
3. **Permissions :** L'utilisateur doit avoir les permissions pour modifier ses propres credentials
4. **Chiffrement :** Les API keys sont chiffrées avant stockage (mais pas les webhook URLs)

---

## 🔗 Références

- [N8N Webhooks Configuration](./N8N_WEBHOOKS_CONFIGURATION.md)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES_REFERENCE.md)
- [Settings API Documentation](../docs/stories/1.11.settings-management-api.md)

---

**Dernière mise à jour:** 2025-01-17

