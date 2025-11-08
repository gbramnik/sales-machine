# 🔗 Configuration des Webhooks N8N

Guide complet pour configurer les webhooks N8N dans Sales Machine.

---

## 🎯 Vue d'Ensemble

Sales Machine utilise **plusieurs workflows N8N**, chacun avec son propre webhook. Il existe **deux méthodes** pour configurer ces webhooks :

1. **Méthode 1 : URL de Base (Fallback)** ⚠️ - Via variable d'environnement
2. **Méthode 2 : Webhooks Spécifiques (Recommandé)** ✅ - Via interface Settings

---

## 📋 Liste des Workflows N8N

Sales Machine utilise les workflows suivants :

| Workflow | Service Name | Description | Fichier |
|----------|--------------|-------------|---------|
| **LinkedIn Scraper** | `n8n_linkedin_scrape` | Scraping de profils LinkedIn | `linkedin-scraper.json` |
| **AI Enrichment** | `n8n_ai_enrichment` | Enrichissement IA des prospects | `ai-enrichment.json` |
| **Email Scheduler** | `n8n_email_send` | Envoi d'emails programmé | `email-scheduler.json` |
| **Email Reply Handler** | `n8n_email_reply` | Traitement des réponses emails | `email-reply-handler.json` |
| **Daily Prospect Detection** | `n8n_daily_detection` | Détection quotidienne de prospects | `daily-prospect-detection.json` |
| **LinkedIn Warm-up** | `n8n_warmup` | Actions de warm-up LinkedIn | `linkedin-warmup-actions.json` |
| **Connection Trigger** | `n8n_connection` | Déclenchement de connexions | `linkedin-connection-trigger.json` |
| **AI Conversation** | `n8n_ai_conversation` | Conversations IA avec prospects | `ai-conversation-agent.json` |
| **Meeting Booking Webhook** | `n8n_meeting_booking` | Réception de confirmations de meetings | `meeting-booking-webhook.json` |
| **Daily Warmup Scheduler** | `n8n_daily_warmup` | Planification quotidienne du warm-up | `daily-warmup-scheduler.json` |
| **Daily Metrics Sync** | `n8n_metrics_sync` | Synchronisation des métriques | `daily-metrics-sync.json` |
| **Domain Verification** | `n8n_domain_verification` | Vérification DNS des domaines | `domain-verification.json` |

---

## ⚙️ Méthode 1 : URL de Base (Fallback)

### Configuration

**Variable d'environnement :** `N8N_WEBHOOK_URL`

**Format :** `https://n8n.srv997159.hstgr.cloud/webhook`

### Utilisation

Cette URL est utilisée comme **fallback** dans certains endroits du code où les webhooks sont construits dynamiquement :

```typescript
// Exemple dans le code
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv997159.hstgr.cloud/webhook';
const webhookUrl = `${n8nWebhookUrl}/daily-detection/manual`;
// Résultat: https://n8n.srv997159.hstgr.cloud/webhook/daily-detection/manual
```

**⚠️ Limitations :**
- Suppose une structure d'URL fixe (`/webhook/{path}`)
- Moins flexible
- Ne permet pas des webhooks différents par utilisateur

### Quand l'utiliser

- Pour le développement rapide
- Si tous vos workflows suivent la même structure d'URL
- Comme fallback si les webhooks spécifiques ne sont pas configurés

---

## ✅ Méthode 2 : Webhooks Spécifiques (Recommandé)

### Configuration

**Stockage :** Table `api_credentials` (via interface Settings)

**Avantages :**
- ✅ Webhooks différents par utilisateur
- ✅ Configuration dynamique sans redéploiement
- ✅ Gestion centralisée via l'interface Settings
- ✅ Chiffrement des URLs sensibles
- ✅ Vérification et test via l'interface

### Étapes de Configuration

#### 1. Créer les Workflows dans N8N

1. Aller sur : https://app.n8n.cloud
2. Pour chaque workflow :
   - Créer ou ouvrir le workflow
   - Ajouter un node **"Webhook"** comme premier node
   - Configurer le webhook :
     - **HTTP Method :** POST
     - **Path :** Laisser N8N générer automatiquement ou définir un path personnalisé
     - **Response Mode :** "Respond to Webhook" (si besoin d'une réponse)
   - **Sauvegarder** le workflow
   - **Activer** le workflow (toggle en haut à droite)

#### 2. Récupérer les URLs des Webhooks

Pour chaque workflow actif :

1. Cliquer sur le node "Webhook"
2. Copier l'**URL complète** affichée dans le node
   - Format : `https://n8n.srv997159.hstgr.cloud/webhook/abc-def-ghi-123`
   - ⚠️ **Important :** Copier l'URL complète, pas juste la base !

#### 3. Configurer dans Sales Machine

**Option A : Via l'Interface Settings (Recommandé)**

1. Se connecter à Sales Machine
2. Aller dans **Settings** → **API Credentials**
3. Pour chaque workflow, ajouter une entrée :
   - **Service Name :** Utiliser le service_name correspondant (voir tableau ci-dessus)
   - **Webhook URL :** Coller l'URL complète du webhook
   - **Cliquer sur "Save"**

**Option B : Via SQL (Admin)**

```sql
-- Exemple : Ajouter le webhook LinkedIn Scraper
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active)
VALUES (
  'your-user-id',
  'n8n_linkedin_scrape',
  'https://n8n.srv997159.hstgr.cloud/webhook/abc-def-ghi-123',
  true
);

-- Répéter pour chaque workflow avec le bon service_name
```

---

## 📝 Mapping Complet : Service Name → Workflow

| Service Name | Workflow | URL Exemple |
|--------------|----------|-------------|
| `n8n_linkedin_scrape` | LinkedIn Scraper | `https://n8n.srv997159.hstgr.cloud/webhook/abc-123` |
| `n8n_ai_enrichment` | AI Enrichment | `https://n8n.srv997159.hstgr.cloud/webhook/def-456` |
| `n8n_email_send` | Email Scheduler | `https://n8n.srv997159.hstgr.cloud/webhook/ghi-789` |
| `n8n_email_reply` | Email Reply Handler | `https://n8n.srv997159.hstgr.cloud/webhook/jkl-012` |
| `n8n_daily_detection` | Daily Prospect Detection | `https://n8n.srv997159.hstgr.cloud/webhook/mno-345` |
| `n8n_warmup` | LinkedIn Warm-up | `https://n8n.srv997159.hstgr.cloud/webhook/pqr-678` |
| `n8n_connection` | Connection Trigger | `https://n8n.srv997159.hstgr.cloud/webhook/stu-901` |
| `n8n_ai_conversation` | AI Conversation | `https://n8n.srv997159.hstgr.cloud/webhook/vwx-234` |

---

## 🔍 Comment Trouver les URLs des Webhooks

### Méthode 1 : Via N8N Dashboard

1. Aller sur : https://app.n8n.cloud
2. Ouvrir le workflow souhaité
3. Cliquer sur le node "Webhook"
4. L'URL complète est affichée dans le node :
   ```
   Webhook URL:
   https://n8n.srv997159.hstgr.cloud/webhook/abc-def-ghi-123
   ```
5. Copier cette URL

### Méthode 2 : Via N8N API

```bash
# Lister tous les workflows
curl -X GET 'https://n8n.srv997159.hstgr.cloud/api/v1/workflows' \
  -H "X-N8N-API-KEY: YOUR_API_KEY"

# Pour chaque workflow, récupérer les détails (y compris les webhooks)
curl -X GET 'https://n8n.srv997159.hstgr.cloud/api/v1/workflows/{workflow-id}' \
  -H "X-N8N-API-KEY: YOUR_API_KEY"
```

---

## ✅ Vérification de la Configuration

### Tester un Webhook

**Via l'Interface Settings :**
1. Aller dans Settings → API Credentials
2. Cliquer sur le bouton "Verify" à côté du webhook
3. Le système enverra une requête de test et affichera le résultat

**Via curl :**
```bash
# Tester le webhook LinkedIn Scraper
curl -X POST 'https://n8n.srv997159.hstgr.cloud/webhook/abc-def-ghi-123' \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Vérifier dans la Base de Données

```sql
-- Voir tous les webhooks configurés pour un utilisateur
SELECT service_name, webhook_url, is_active, last_verified_at
FROM api_credentials
WHERE user_id = 'your-user-id'
  AND service_name LIKE 'n8n_%'
ORDER BY service_name;
```

---

## 🚨 Dépannage

### Erreur: "N8N webhook not configured"

**Cause :** Le webhook spécifique n'est pas trouvé dans `api_credentials`.

**Solution :**
1. Vérifier que le webhook est bien configuré dans Settings → API Credentials
2. Vérifier que le `service_name` correspond exactement (ex: `n8n_linkedin_scrape`)
3. Vérifier que `is_active = true`

### Erreur: "N8N webhook failed: 404"

**Cause :** L'URL du webhook est incorrecte ou le workflow n'est pas actif.

**Solution :**
1. Vérifier que le workflow est **activé** dans N8N
2. Vérifier que l'URL est correcte (copier depuis N8N, ne pas la construire manuellement)
3. Tester l'URL directement avec curl

### Erreur: "N8N webhook failed: 401"

**Cause :** Le webhook nécessite une authentification (token).

**Solution :**
1. Vérifier si le webhook nécessite un token dans N8N
2. Configurer `N8N_WEBHOOK_TOKEN` dans les variables d'environnement
3. Ou ajouter le token dans les headers de la requête

---

## 📚 Recommandations

### Pour le Développement

1. Utilisez la **Méthode 2** (webhooks spécifiques) dès le début
2. Configurez au minimum les webhooks critiques :
   - `n8n_linkedin_scrape`
   - `n8n_ai_enrichment`
   - `n8n_daily_detection`
3. Testez chaque webhook après configuration

### Pour la Production

1. **Tous les webhooks** doivent être configurés via Settings (Méthode 2)
2. La variable `N8N_WEBHOOK_URL` peut être laissée vide
3. Activer la vérification automatique des webhooks
4. Monitorer les erreurs de webhook dans les logs

---

## 🔗 Références

- [N8N Documentation](https://docs.n8n.io)
- [N8N Webhook Nodes](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.webhook/)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES_REFERENCE.md)
- [Settings API Documentation](../docs/stories/1.11.settings-management-api.md)

---

**Dernière mise à jour:** 2025-01-17



