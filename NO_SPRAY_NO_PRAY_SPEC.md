# No Spray No Pray - Spécifications Techniques

**Date:** 11 Janvier 2025  
**Version:** 1.0  
**Status:** En définition

---

## 🎯 Vision Produit

**No Spray No Pray** est une plateforme de prospection LinkedIn ultra-qualifiée automatisée. Contrairement au "spray and pray" traditionnel, chaque prospect est:
1. **Sélectionné** selon ICP + Persona précis
2. **Enrichi** avec contexte maximum (profil + entreprise + web)
3. **Warm-up** sur LinkedIn avant connexion (7-15 jours)
4. **Contacté** de manière personnalisée (LinkedIn puis Email)
5. **Suivi** par IA conversationnelle (LinkedIn + Email)

---

## 📋 Stack Technique Confirmée

### LinkedIn Automation
- **UniPil API**
  - Coût: 5€/compte LinkedIn
  - Features: Warm-up (likes, commentaires), connexions, messages
  - Rate limits: 20 prospects/jour (max 40 configurable)
  - Documentation: Disponible

### Email Sending
- **SMTP Dédié** (priorité)
  - Volume: 50-100 emails/jour max
  - Providers à évaluer: SendGrid, Mailgun, AWS SES
  - Warm-up nécessaire: 2-3 semaines
  - Fallback: À définir (optionnel)

### Email Finder
- **À définir** (Anymail ou Better Contacts)
  - Même fonctionnalité: Email + téléphone
  - Intégration API standard
  - Définition ultérieure

### Enrichissement
- **Claude API** (existant)
  - Talking points générés
  - Contexte conversation
- **Scraping Web** (nouveau)
  - Site web prospect
  - Technologies à définir

---

## 🔄 Workflow Daily

### 1. Détection Prospects (6h du matin)

**Input:**
- ICP + Persona (défini onboarding, peut être multiple)
- Exclure prospects déjà contactés (historique)

**Process:**
- UniPil API: Recherche LinkedIn selon ICP/Persona
- Sélection: 20 prospects/jour (configurable, max 40)
- Filtrage: Exclusion prospects déjà contactés

**Output:**
- Liste 20 prospects/jour
- Mode: Full autopilot OU Semi-auto (validation utilisateur)

### 2. Extraction Données

**Données extraites:**
- Profil LinkedIn complet (via UniPil)
- Page entreprise LinkedIn (via UniPil)
- Scraping site web (si disponible)
- Email finder (API externe, à définir)
- Téléphone (optionnel, via email finder)

**Stockage:**
- `prospects` table (profil LinkedIn)
- `prospect_enrichment` table (contexte, talking points)
- `prospect_enrichment.company_data` (données entreprise)
- `prospect_enrichment.website_data` (scraping web)

### 3. Warm-up LinkedIn (7-15 jours)

**Délai:**
- Minimum: 7 jours (configurable)
- Maximum: 15 jours (configurable)
- Par défaut: 10 jours

**Actions quotidiennes:**
- **Likes:** 30-40/jour (configurable, recommandation LinkedIn)
- **Commentaires:** 30-40/jour (configurable, recommandation LinkedIn)
- **Détection auteurs:** Si prospect ne publie pas, détecter auteurs qu'ils commentent → interaction

**Limites selon compte:**
- **Compte LinkedIn basique:** Limites conservatrices (20 likes/jour, 20 commentaires/jour)
- **Sales Navigator:** Limites plus élevées (40 likes/jour, 40 commentaires/jour)

**Risque LinkedIn:**
- Respecter limites recommandées
- Éviter patterns suspects
- Espacement actions dans le temps

**Stockage:**
- `linkedin_warmup_actions` table (prospect_id, action_type, target_post, timestamp)
- `linkedin_warmup_schedule` table (prospect_id, warmup_start, connection_ready_at)

### 4. Connexion LinkedIn

**Trigger:**
- Après délai warm-up (7-15 jours)
- Prospect ready for connection

**Action:**
- UniPil API: Envoi invitation LinkedIn
- Message personnalisé (basé enrichissement)

**Stockage:**
- `linkedin_connections` table (prospect_id, invitation_sent_at, status)

### 5. Conversation IA

**Si connexion acceptée:**
- Conversation LinkedIn (via UniPil API)
- Conversation Email (via SMTP dédié)
- IA gère les deux canaux simultanément

**Si connexion refusée:**
- Fallback Email uniquement
- SMTP dédié: Envoi email personnalisé

**IA Conversation:**
- Claude API (existant)
- Contexte: Enrichissement complet (profil + entreprise + web)
- Multi-canal: LinkedIn + Email simultané

**Stockage:**
- `conversations` table (prospect_id, channel, message, timestamp)
- `conversation_threads` table (prospect_id, thread_id, status)

---

## 🗄️ Database Schema (Nouvelles Tables)

### `linkedin_warmup_actions`
```sql
CREATE TABLE linkedin_warmup_actions (
  id UUID PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id),
  user_id UUID REFERENCES users(id),
  action_type TEXT CHECK (action_type IN ('like', 'comment', 'follow_author')),
  target_post_url TEXT,
  target_author_url TEXT,
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `linkedin_warmup_schedule`
```sql
CREATE TABLE linkedin_warmup_schedule (
  id UUID PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id),
  user_id UUID REFERENCES users(id),
  warmup_start TIMESTAMPTZ,
  connection_ready_at TIMESTAMPTZ,
  warmup_duration_days INTEGER DEFAULT 10,
  actions_completed INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'ready_for_connection')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `linkedin_connections`
```sql
CREATE TABLE linkedin_connections (
  id UUID PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id),
  user_id UUID REFERENCES users(id),
  invitation_sent_at TIMESTAMPTZ,
  invitation_message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'ignored')),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `conversations` (étendre existant)
```sql
ALTER TABLE conversations ADD COLUMN channel TEXT CHECK (channel IN ('linkedin', 'email', 'both'));
ALTER TABLE conversations ADD COLUMN linkedin_message_id TEXT;
ALTER TABLE conversations ADD COLUMN email_message_id TEXT;
```

### `prospect_enrichment` (étendre existant)
```sql
ALTER TABLE prospect_enrichment ADD COLUMN company_data JSONB;
ALTER TABLE prospect_enrichment ADD COLUMN website_data JSONB;
ALTER TABLE prospect_enrichment ADD COLUMN email_found TEXT;
ALTER TABLE prospect_enrichment ADD COLUMN phone_found TEXT;
```

---

## 🎛️ Configuration Utilisateur

### Settings Panel (étendre existant)

**Warm-up LinkedIn:**
- Délai minimum (jours): 7-15, défaut 10
- Délai maximum (jours): 7-15, défaut 15
- Likes par jour: 20-40, défaut 30
- Commentaires par jour: 20-40, défaut 30
- Compte Sales Navigator: Oui/Non (affecte limites)

**Prospects Quotidiens:**
- Nombre prospects/jour: 20-40, défaut 20
- Mode: Full autopilot / Semi-auto (validation)
- Heure détection: 6h du matin (configurable)

**ICP + Persona:**
- Multiple ICP/Persona supportés
- Défini lors onboarding
- Utilisé pour sélection quotidienne

**SMTP:**
- Provider: SendGrid / Mailgun / AWS SES (à définir)
- Domain: Configuré
- Warm-up: 2-3 semaines

**Email Finder:**
- Provider: Anymail / Better Contacts (à définir)
- API Key: Configuré

---

## 📊 Workflow N8N

### Workflow 1: Daily Prospect Detection (6h)
1. Trigger: Schedule (6h du matin)
2. Récupérer ICP + Persona utilisateur
3. UniPil API: Recherche LinkedIn
4. Filtrage: Exclure déjà contactés
5. Sélection: 20 prospects (ou configurable)
6. Mode semi-auto: Présenter à validation
7. Stockage: `prospects` table

### Workflow 2: Enrichissement Prospect
1. Trigger: Prospect détecté
2. UniPil API: Extraction profil + entreprise
3. Scraping web: Site web prospect
4. Email Finder API: Recherche email + téléphone
5. Claude API: Génération talking points
6. Stockage: `prospect_enrichment` table

### Workflow 3: Warm-up LinkedIn
1. Trigger: Prospect enrichi
2. Créer `linkedin_warmup_schedule` (7-15 jours)
3. Daily: Likes/commentaires (30-40/jour)
4. Détection auteurs: Si pas de posts, trouver auteurs commentés
5. Stockage: `linkedin_warmup_actions`
6. Après délai: Marquer "ready_for_connection"

### Workflow 4: Connexion LinkedIn
1. Trigger: Warm-up terminé
2. UniPil API: Envoi invitation
3. Message personnalisé (enrichissement)
4. Stockage: `linkedin_connections`

### Workflow 5: Conversation IA Multi-canal
1. Trigger: Connexion acceptée OU refusée
2. Si acceptée: Conversation LinkedIn + Email
3. Si refusée: Email uniquement
4. Claude API: Génération réponses
5. UniPil API: Envoi LinkedIn
6. SMTP: Envoi Email
7. Stockage: `conversations`

---

## 🚀 Plan d'Implémentation

### Phase 1: Stack Changes (Semaine 1)
- [ ] Créer `UniPilService.ts`
- [ ] Adapter workflow N8N LinkedIn scraping
- [ ] Évaluer SMTP providers (SendGrid/Mailgun/SES)
- [ ] Créer `SMTPService.ts`
- [ ] Settings panel: SMTP configuration

### Phase 2: Warm-up LinkedIn (Semaine 1-2)
- [ ] Créer tables `linkedin_warmup_*`
- [ ] Workflow N8N: Warm-up daily actions
- [ ] Détection auteurs commentés (API externe)
- [ ] Settings panel: Warm-up configuration
- [ ] Logique délai 7-15 jours

### Phase 3: Enrichissement Étendu (Semaine 2)
- [ ] UniPil: Extraction page entreprise
- [ ] Scraping web (Puppeteer/Playwright)
- [ ] Email Finder API (à définir)
- [ ] Étendre `prospect_enrichment` table
- [ ] Workflow N8N: Enrichissement complet

### Phase 4: Conversation IA Multi-canal (Semaine 2-3)
- [ ] Étendre `AIConversationService` (LinkedIn + Email)
- [ ] Workflow N8N: Conversation multi-canal
- [ ] Fallback Email si connexion refusée
- [ ] Dashboard: Vue conversations LinkedIn + Email

### Phase 5: Daily Workflow (Semaine 3)
- [ ] Workflow N8N: Daily detection (6h)
- [ ] Filtrage prospects déjà contactés
- [ ] Mode semi-auto: Validation utilisateur
- [ ] Settings panel: Configuration daily

---

## ✅ Validation

### Questions Répondues
- ✅ UniPil: API disponible, 5€/compte, supporte warm-up
- ✅ SMTP: 50-100 emails/jour, solution à définir
- ✅ Email Finder: À définir (Anymail/Better Contacts)
- ✅ Warm-up: 7-15 jours, 30-40 actions/jour, limites selon compte
- ✅ Workflow: 20 prospects/jour (max 40), 6h du matin, mode autopilot/semi-auto

### Questions Restantes
- ⏳ SMTP provider: SendGrid / Mailgun / AWS SES? (À évaluer)
- ⏳ Email Finder: Anymail / Better Contacts? (À définir)
- ⏳ Scraping web: Puppeteer / Playwright / ScrapingBee? (À définir)
- ⏳ API détection auteurs: Quelle API? (Utilisateur mentionné avoir une API)

---

**Prochaine étape:** Lancer `*correct-course` pour formaliser changement PRD/Architecture


