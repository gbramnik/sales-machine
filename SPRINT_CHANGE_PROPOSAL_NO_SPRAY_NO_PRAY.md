# Sprint Change Proposal: Pivot vers "No Spray No Pray"

**Date:** 11 Janvier 2025  
**Agent:** John (PM Agent)  
**Mode:** YOLO (Batch Processing)  
**Status:** En attente d'approbation

---

## 1. Identified Issue Summary

### Change Trigger
**Pivot stratégique complet** - Transformation de "Sales Machine" en "No Spray No Pray":
- Changement de vision produit (prospection ultra-qualifiée vs multi-channel)
- Changement de stack technique (UniPil au lieu de PhantomBuster, SMTP dédié au lieu d'Instantly)
- Nouveau workflow (Warm-up LinkedIn avant connexion, 7-15 jours)
- Focus LinkedIn-first (au lieu de Email-first)
- Conversation multi-canal (LinkedIn + Email simultané)

### Type de Changement
- [x] Pivot stratégique basé sur nouvelle vision
- [x] Changement de stack technique (UniPil, SMTP)
- [x] Nouveau workflow (Warm-up LinkedIn)
- [x] Révision MVP scope

### Impact Initial
- **Code existant:** ~70% réutilisable (infrastructure, DB, frontend, IA)
- **Stack changes:** PhantomBuster → UniPil, Instantly → SMTP dédié
- **Nouvelles features:** Warm-up LinkedIn, enrichissement entreprise, scraping web, email finder
- **Timeline:** Adaptation 1-2 semaines vs reboot 3-4 semaines

---

## 2. Epic Impact Summary

### Epic 1: Foundation & Micro-MVP Core

**Status Actuel:** Partiellement complété (Story 1.1 done, Story 1.2 en cours)

**Impact:**
- **Story 1.2:** LinkedIn Scraping → **CHANGEMENT MAJEUR**
  - PhantomBuster → UniPil
  - Ajouter extraction page entreprise
  - Ajouter scraping web
  - Ajouter email finder
  
- **Story 1.3:** AI Enrichment → **ÉTENDRE**
  - Ajouter enrichissement entreprise (page LinkedIn entreprise)
  - Ajouter scraping web (site web prospect)
  - Ajouter email finder (email + téléphone)
  
- **Story 1.4:** Email Templates → **ADAPTER**
  - Templates LinkedIn + Email (au lieu de Email uniquement)
  
- **Story 1.5:** Email Infrastructure → **CHANGEMENT**
  - Instantly.ai → SMTP dédié (SendGrid/Mailgun/SES)
  
- **Story 1.6:** AI Conversation → **ÉTENDRE**
  - Email-only → LinkedIn + Email simultané
  - Fallback Email si connexion refusée
  
- **NOUVELLE Story 1.9:** Warm-up LinkedIn → **CRÉER**
  - Warm-up 7-15 jours (likes, commentaires)
  - Détection auteurs commentés
  - Délai configurable avant connexion
  
- **NOUVELLE Story 1.10:** Daily Prospect Detection → **CRÉER**
  - 20 prospects/jour (max 40 configurable)
  - Détection 6h du matin
  - Mode autopilot/semi-auto
  - Exclusion prospects déjà contactés

**Recommandation:** Epic 1 doit être **révisé complètement** avec nouvelles stories et modifications existantes.

### Epic 2: AI Safety & Quality Guardrails

**Impact:** **MINIMAL** - Les guardrails restent valides (confidence scoring, VIP mode, fact-checking)

**Changements mineurs:**
- Étendre guardrails pour LinkedIn messages (en plus d'Email)
- Validation humanness pour LinkedIn (style conversation LinkedIn vs Email)

**Recommandation:** Epic 2 reste valide, **adaptations mineures** seulement.

### Epic 3: Multi-Channel Expansion

**Impact:** **DÉPRIORISÉ** - Focus LinkedIn-first, multi-channel devient Phase 2+

**Changements:**
- WhatsApp/Instagram reportés (pas dans MVP "No Spray No Pray")
- Google Maps scraping reporté (pas prioritaire)

**Recommandation:** Epic 3 **déplacé après MVP**, scope réduit pour MVP.

### Epic 4: Advanced Intent Signals & MCP Architecture

**Impact:** **DÉPRIORISÉ** - MCP architecture reportée pour simplifier MVP

**Changements:**
- MCP abstraction layer reporté (Phase 2+)
- BuiltWith tech stack reporté (Phase 2+)
- Social engagement signals reportés (Phase 2+)

**Recommandation:** Epic 4 **déplacé après MVP**, pas nécessaire pour validation MVP.

### Epic 5: Zero-Config Onboarding & Dashboard UX

**Impact:** **ADAPTER** - Onboarding doit inclure configuration ICP + Persona (peut être multiple)

**Changements:**
- Onboarding: Ajouter configuration ICP + Persona (multiple support)
- Onboarding: Ajouter configuration warm-up LinkedIn (délai, actions/jour)
- Onboarding: Ajouter configuration SMTP (au lieu d'Instantly)
- Dashboard: Ajouter vue warm-up LinkedIn (prospects en warm-up)
- Dashboard: Ajouter vue conversations LinkedIn + Email

**Recommandation:** Epic 5 reste valide, **adaptations modérées**.

### Epic 6: Production Readiness & Scale Prep

**Impact:** **MINIMAL** - Les requirements production restent valides

**Recommandation:** Epic 6 reste valide, **aucun changement**.

---

## 3. Artifact Adjustment Needs

### PRD (docs/prd/)

**Fichiers à modifier:**
1. **`goals-and-background-context.md`**
   - Changer nom produit: "Sales Machine" → "No Spray No Pray"
   - Réviser vision: LinkedIn-first ultra-qualifié vs multi-channel
   - Réviser goals: 20 prospects/jour warm-up vs 10-30 meetings/month
   
2. **`requirements.md`**
   - FR1: LinkedIn scraping → UniPil (au lieu de PhantomBuster)
   - FR5: Email sending → SMTP dédié (au lieu d'Instantly)
   - FR8: LinkedIn connections → Warm-up avant connexion (nouveau)
   - FR9: Templates → LinkedIn + Email (au lieu de Email uniquement)
   - FR10: AI conversation → LinkedIn + Email simultané (nouveau)
   - **NOUVEAU FR23:** Warm-up LinkedIn (7-15 jours, likes, commentaires)
   - **NOUVEAU FR24:** Daily prospect detection (20/jour, 6h du matin)
   - **NOUVEAU FR25:** Enrichissement entreprise (page LinkedIn entreprise)
   - **NOUVEAU FR26:** Scraping web (site web prospect)
   - **NOUVEAU FR27:** Email finder (API externe)
   
3. **`epic-list.md`**
   - Epic 1: Réviser goal et timeline
   - Epic 3: Déprioriser (Phase 2+)
   - Epic 4: Déprioriser (Phase 2+)
   
4. **`epic-1-foundation-micro-mvp-core-linkedin-scraping-email-basic-ai-agent.md`**
   - Réviser toutes les stories (1.2 à 1.8)
   - Ajouter Story 1.9: Warm-up LinkedIn
   - Ajouter Story 1.10: Daily Prospect Detection
   
5. **`technical-assumptions.md`**
   - LinkedIn scraping: PhantomBuster → UniPil
   - Email sending: Instantly.ai → SMTP dédié
   - Intégrations: Ajouter email finder API

### Architecture (docs/architecture/)

**Fichiers à modifier:**
1. **`high-level-architecture.md`**
   - Intégrations: PhantomBuster → UniPil
   - Intégrations: Instantly.ai → SMTP dédié (SendGrid/Mailgun/SES)
   - Nouveau: Email finder API
   - Nouveau: Workflow warm-up LinkedIn
   
2. **`backend-architecture.md`**
   - Services: Créer `UniPilService.ts`
   - Services: Créer `SMTPService.ts`
   - Services: Créer `WarmupService.ts`
   - Services: Étendre `AIConversationService` (LinkedIn + Email)
   
3. **`database-schema.md`**
   - Tables: Ajouter `linkedin_warmup_actions`
   - Tables: Ajouter `linkedin_warmup_schedule`
   - Tables: Ajouter `linkedin_connections`
   - Tables: Étendre `prospect_enrichment` (company_data, website_data, email_found, phone_found)
   - Tables: Étendre `conversations` (channel, linkedin_message_id, email_message_id)
   
4. **`components.md`**
   - N8N Workflows: Ajouter "Daily Prospect Detection"
   - N8N Workflows: Ajouter "Warm-up LinkedIn"
   - N8N Workflows: Modifier "LinkedIn Scraping" (UniPil)
   - N8N Workflows: Modifier "Email Sending" (SMTP)
   - N8N Workflows: Modifier "AI Conversation" (LinkedIn + Email)

### Stories (docs/stories/)

**Fichiers à modifier/créer:**
1. **`1.2.linkedin-profile-scraping-workflow.md`** → **RÉVISER**
   - PhantomBuster → UniPil
   - Ajouter extraction page entreprise
   - Ajouter scraping web
   - Ajouter email finder
   
2. **`1.3.ai-powered-contextual-enrichment.md`** → **RÉVISER**
   - Ajouter enrichissement entreprise
   - Ajouter scraping web
   - Ajouter email finder
   
3. **`1.5.email-campaign-infrastructure.md`** → **RÉVISER**
   - Instantly.ai → SMTP dédié
   
4. **`1.6.basic-ai-conversational-agent.md`** → **RÉVISER**
   - Email-only → LinkedIn + Email
   - Fallback Email si connexion refusée
   
5. **`1.9.linkedin-warmup-workflow.md`** → **CRÉER**
   - Warm-up 7-15 jours
   - Likes/commentaires (30-40/jour)
   - Détection auteurs commentés
   - Délai configurable
   
6. **`1.10.daily-prospect-detection.md`** → **CRÉER**
   - 20 prospects/jour (max 40)
   - Détection 6h du matin
   - Mode autopilot/semi-auto
   - Exclusion prospects déjà contactés

---

## 4. Recommended Path Forward

### Option Choisie: **Option 3 - PRD MVP Review & Re-scoping**

**Rationale:**
1. ✅ Pivot stratégique complet justifie révision PRD
2. ✅ MVP scope change (LinkedIn-first vs multi-channel)
3. ✅ Stack technique change (UniPil, SMTP dédié)
4. ✅ Nouveau workflow (Warm-up LinkedIn)
5. ✅ ~70% code réutilisable (adaptation vs reboot)

**Effort Estimé:**
- **PRD révision:** 1-2 jours
- **Architecture révision:** 1 jour
- **Stories révision/création:** 2-3 jours
- **Code adaptation:** 1-2 semaines (Phase 1-4)

**Risques:**
- ⚠️ Timeline MVP: 6 semaines → 7-8 semaines (ajout warm-up)
- ⚠️ Complexité: Warm-up LinkedIn ajoute complexité
- ⚠️ Stack: SMTP dédié nécessite warm-up email (2-3 semaines)

**Mitigation:**
- ✅ Code réutilisable (~70%)
- ✅ Infrastructure existante (Supabase, Railway, N8N, Upstash)
- ✅ Approche progressive (Phase 1-4)

---

## 5. PRD MVP Impact

### MVP Scope Révisé

**Ancien MVP (Sales Machine):**
- LinkedIn scraping (PhantomBuster)
- Email campaigns (Instantly.ai)
- AI conversation (Email-only)
- Multi-channel (Phase 2+)

**Nouveau MVP (No Spray No Pray):**
- LinkedIn scraping (UniPil) + page entreprise
- Warm-up LinkedIn (7-15 jours)
- Connexion LinkedIn (après warm-up)
- Conversation IA (LinkedIn + Email)
- Email fallback (si connexion refusée)
- SMTP dédié (50-100 emails/jour)
- Enrichissement étendu (entreprise, web, email finder)
- Daily detection (20 prospects/jour, 6h du matin)

**Goals Révisés:**
- Ancien: 10-30 meetings/month, 5 beta users, 3+ meetings chacun
- Nouveau: 20 prospects/jour, warm-up 7-15 jours, connexions LinkedIn, conversations IA

**Timeline:**
- Ancien: 6 semaines (240h)
- Nouveau: 7-8 semaines (280-320h) - Ajout warm-up + stack changes

---

## 6. High-Level Action Plan

### Phase 1: PRD & Architecture Révision (Semaine 1)
1. **Réviser PRD**
   - `goals-and-background-context.md` (nom, vision, goals)
   - `requirements.md` (FRs révisés + nouveaux FRs)
   - `epic-list.md` (priorités révisées)
   - `epic-1-*.md` (stories révisées + nouvelles)
   
2. **Réviser Architecture**
   - `high-level-architecture.md` (stack, intégrations)
   - `backend-architecture.md` (services, workflows)
   - `database-schema.md` (nouvelles tables)
   - `components.md` (N8N workflows)

### Phase 2: Stories Révision/Création (Semaine 1-2)
3. **Réviser Stories Existantes**
   - Story 1.2 (LinkedIn scraping → UniPil)
   - Story 1.3 (Enrichissement étendu)
   - Story 1.5 (SMTP dédié)
   - Story 1.6 (Conversation LinkedIn + Email)
   
4. **Créer Nouvelles Stories**
   - Story 1.9 (Warm-up LinkedIn)
   - Story 1.10 (Daily Prospect Detection)

### Phase 3: Code Adaptation - Stack Changes (Semaine 2-3)
5. **UniPil Integration**
   - Créer `UniPilService.ts`
   - Adapter workflow N8N LinkedIn scraping
   - Migrer endpoints API
   
6. **SMTP Dédié**
   - Évaluer providers (SendGrid/Mailgun/SES)
   - Créer `SMTPService.ts`
   - Settings panel: SMTP configuration

### Phase 4: Code Adaptation - Warm-up LinkedIn (Semaine 3-4)
7. **Database Schema**
   - Créer tables `linkedin_warmup_*`
   - Créer table `linkedin_connections`
   - Étendre `prospect_enrichment`
   
8. **Workflow Warm-up**
   - N8N workflow: Daily warm-up actions
   - Détection auteurs commentés
   - Logique délai 7-15 jours

### Phase 5: Code Adaptation - Enrichissement Étendu (Semaine 4-5)
9. **Enrichissement Entreprise**
   - UniPil: Extraction page entreprise
   - Stockage `company_data`
   
10. **Scraping Web**
    - Service scraping (Puppeteer/Playwright)
    - Stockage `website_data`
    
11. **Email Finder**
    - Intégration API (à définir)
    - Stockage email + téléphone

### Phase 6: Code Adaptation - Conversation Multi-canal (Semaine 5-6)
12. **IA Conversation LinkedIn**
    - Étendre `AIConversationService`
    - Gestion LinkedIn + Email simultané
    
13. **Fallback Email**
    - Si connexion refusée: Email uniquement

### Phase 7: Daily Workflow (Semaine 6-7)
14. **Daily Detection**
    - N8N workflow: 6h du matin
    - Filtrage prospects déjà contactés
    - Mode autopilot/semi-auto

### Phase 8: Testing & Validation (Semaine 7-8)
15. **End-to-End Testing**
    - Workflow complet: Detection → Enrichissement → Warm-up → Connexion → Conversation
    - Validation avec 5 beta users

---

## 7. Agent Handoff Plan

### PM Agent (John)
- ✅ **Responsable:** PRD révision, Epic révision, Stories création/révision
- ✅ **Délivrables:** PRD révisé, Epic 1 révisé, Stories 1.9 et 1.10 créées
- ✅ **Timeline:** Semaine 1-2

### Architect Agent
- ⏳ **Responsable:** Architecture révision, Database schema, API specifications
- ⏳ **Délivrables:** Architecture révisée, Database schema, API specs
- ⏳ **Timeline:** Semaine 1-2 (en parallèle PM)

### Dev Agent
- ⏳ **Responsable:** Code adaptation, Stack changes, N8N workflows
- ⏳ **Délivrables:** Code adapté, Services créés, Workflows N8N
- ⏳ **Timeline:** Semaine 2-8

### QA Agent
- ⏳ **Responsable:** Testing end-to-end, Validation MVP
- ⏳ **Délivrables:** Tests passés, MVP validé
- ⏳ **Timeline:** Semaine 7-8

---

## 8. Success Criteria

### Validation Technique
- [ ] UniPil API intégrée et fonctionnelle
- [ ] SMTP dédié configuré et testé
- [ ] Warm-up LinkedIn fonctionnel (7-15 jours)
- [ ] Daily detection fonctionnelle (20 prospects/jour, 6h)
- [ ] Conversation LinkedIn + Email fonctionnelle
- [ ] Enrichissement complet (profil + entreprise + web + email)

### Validation Produit
- [ ] 5 beta users configurés
- [ ] 20 prospects/jour détectés
- [ ] Warm-up effectué (7-15 jours)
- [ ] Connexions LinkedIn envoyées
- [ ] Conversations IA actives (LinkedIn + Email)
- [ ] Fallback Email fonctionnel

---

## 9. Risks & Mitigation

### Risques Techniques
1. **UniPil API limitations**
   - Mitigation: Tester API avant intégration complète
   
2. **SMTP deliverability**
   - Mitigation: Warm-up email 2-3 semaines, monitoring
   
3. **LinkedIn ban risk (warm-up)**
   - Mitigation: Respecter limites (30-40 actions/jour), espacer actions
   
4. **Complexité warm-up**
   - Mitigation: Approche progressive, tests unitaires

### Risques Produit
1. **Timeline dépassée**
   - Mitigation: MVP scope réduit (warm-up minimum viable)
   
2. **Beta users insatisfaits**
   - Mitigation: Communication claire, feedback loops

---

## 10. Approval Required

**Ce document nécessite:**
- [x] Analyse complète effectuée
- [ ] **User Approval:** Approbation explicite du pivot
- [ ] **PM Approval:** Validation PRD révision
- [ ] **Architect Approval:** Validation architecture révision
- [ ] **Dev Approval:** Validation faisabilité technique

**Next Steps après approbation:**
1. PM: Réviser PRD (Semaine 1)
2. Architect: Réviser Architecture (Semaine 1)
3. PM: Créer/Réviser Stories (Semaine 1-2)
4. Dev: Commencer Phase 3 (Stack changes, Semaine 2)

---

**Document créé:** 11 Janvier 2025  
**Mode:** YOLO (Batch Processing)  
**Status:** En attente d'approbation


