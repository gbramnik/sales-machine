# ✅ Déploiement des Webhooks N8N - Résumé

## 🎯 Ce qui a été fait

### 1. Migration SQL créée et déployée ✅

**Migration :** `setup_n8n_webhooks_function`

**Fonction créée :** `setup_n8n_webhooks_for_user(p_user_id UUID)`

Cette fonction configure automatiquement **6 webhooks N8N** pour un utilisateur :
- `n8n_linkedin_scrape` - LinkedIn Profile Scraper
- `n8n_ai_enrichment` - AI-Powered Contextual Enrichment
- `n8n_email_reply` - AI Conversation Agent (Email Reply)
- `n8n_ai_conversation` - AI Conversation Agent (LinkedIn Reply)
- `n8n_meeting_booking` - Meeting Booking Webhook
- `n8n_domain_verification` - Domain Verification

### 2. URLs des webhooks récupérées via MCP N8N ✅

Toutes les URLs ont été récupérées depuis N8N Cloud via le MCP et ajoutées à :
- ✅ `docs/ENVIRONMENT_VARIABLES_REFERENCE.md`
- ✅ `apps/api/.env.example`
- ✅ `scripts/setup-n8n-webhooks.sql`

### 3. Scripts de configuration créés ✅

- ✅ `scripts/setup-n8n-webhooks.ts` - Script TypeScript
- ✅ `scripts/setup-n8n-webhooks.sql` - Script SQL manuel
- ✅ `scripts/setup-n8n-webhooks-example.sql` - Exemples d'utilisation

### 4. Documentation mise à jour ✅

- ✅ `docs/N8N_WEBHOOKS_SETUP.md` - Guide complet
- ✅ `docs/N8N_WEBHOOKS_CONFIGURATION.md` - Configuration détaillée
- ✅ `docs/ENV_SETUP_INSTRUCTIONS.md` - Instructions mises à jour

---

## 🚀 Comment utiliser

### Option 1 : Via la fonction SQL (Recommandé)

```sql
-- Pour un utilisateur spécifique
SELECT * FROM setup_n8n_webhooks_for_user('USER_ID'::uuid);

-- Pour tous les utilisateurs
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    PERFORM setup_n8n_webhooks_for_user(user_record.id);
  END LOOP;
END $$;
```

### Option 2 : Via le script TypeScript

```bash
npm run setup:n8n-webhooks <USER_ID>
```

### Option 3 : Via l'API REST

```bash
curl -X POST http://localhost:3000/api/settings/api-credentials \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "n8n_linkedin_scrape",
    "webhook_url": "https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper"
  }'
```

---

## 📋 URLs des Webhooks Configurés

| Service Name | URL | Workflow ID |
|--------------|-----|-------------|
| `n8n_linkedin_scrape` | `https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper` | `bSH0ds0r0PEyxIsv` |
| `n8n_ai_enrichment` | `https://n8n.srv997159.hstgr.cloud/webhook/ai-enrichment` | `DG6jPgRIP4KgrAKl` |
| `n8n_email_reply` | `https://n8n.srv997159.hstgr.cloud/webhook/smtp/email-reply` | `TZBWM2CaRWzUUPiS` |
| `n8n_ai_conversation` | `https://n8n.srv997159.hstgr.cloud/webhook/unipil/linkedin-reply` | `TZBWM2CaRWzUUPiS` |
| `n8n_meeting_booking` | `https://n8n.srv997159.hstgr.cloud/webhook/meeting-booking` | `iwI4yZbkNXbYjrgj` |
| `n8n_domain_verification` | `https://n8n.srv997159.hstgr.cloud/webhook/domain-verification` | `JFJ6dZZcm6CpXkVZ` |

---

## ⚠️ Prochaines étapes

1. **Activer les workflows dans N8N :**
   - Aller sur https://app.n8n.cloud
   - Activer chaque workflow (toggle en haut à droite)

2. **Configurer les webhooks pour vos utilisateurs :**
   - Utiliser la fonction SQL `setup_n8n_webhooks_for_user()`
   - Ou utiliser le script TypeScript
   - Ou configurer via l'interface Settings

3. **Vérifier la configuration :**
   ```sql
   SELECT * FROM api_credentials 
   WHERE service_name LIKE 'n8n_%' 
   ORDER BY service_name;
   ```

---

## 📚 Documentation

- [Guide de Configuration](./N8N_WEBHOOKS_SETUP.md)
- [Configuration Détaillée](./N8N_WEBHOOKS_CONFIGURATION.md)
- [Variables d'Environnement](./ENVIRONMENT_VARIABLES_REFERENCE.md)

---

**Date de déploiement :** 2025-01-17  
**Migration :** `setup_n8n_webhooks_function`  
**Statut :** ✅ Déployé avec succès



