# Résolution Conflit Numérotation Stories

**Date:** 11 Janvier 2025  
**Problème:** Les stories 1.9 et 1.10 existent déjà (Settings API, Campaign API), mais le pivot "No Spray No Pray" nécessite de créer de nouvelles stories avec les mêmes numéros.

---

## 🔍 Situation Actuelle

### Stories Existantes (Créées lors de la Réconciliation)
- **Story 1.9**: Settings Management API (`1.9.settings-management-api.md`)
  - Status: Ready for Review
  - Documente le code API existant pour `/settings/*`
  
- **Story 1.10**: Campaign Management API (`1.10.campaign-management-api.md`)
  - Status: Ready for Review
  - Documente le code API existant pour `/campaigns/*`

### Nouvelles Stories Requises (Pivot "No Spray No Pray")
- **Story 1.9**: LinkedIn Warm-up Workflow
  - Warm-up 7-15 jours
  - Likes/commentaires (30-40/jour)
  - Détection auteurs commentés
  
- **Story 1.10**: Daily Prospect Detection & Filtering
  - 20 prospects/jour (max 40)
  - Détection 6h du matin
  - Mode autopilot/semi-auto

---

## ✅ Solutions Proposées

### Option A: Renommer Stories Existantes (RECOMMANDÉ)

**Action:**
1. Renommer `1.9.settings-management-api.md` → `1.11.settings-management-api.md`
2. Renommer `1.10.campaign-management-api.md` → `1.12.campaign-management-api.md`
3. Créer nouvelles stories:
   - `1.9.linkedin-warmup-workflow.md`
   - `1.10.daily-prospect-detection-filtering.md`

**Avantages:**
- ✅ Respecte la logique du pivot "No Spray No Pray"
- ✅ Les stories API existantes gardent leur numérotation séquentielle
- ✅ Les nouvelles stories core (warm-up, detection) ont les numéros 1.9 et 1.10
- ✅ Cohérent avec l'ordre logique: infrastructure → core features → management APIs

**Inconvénients:**
- ⚠️ Nécessite de renommer 2 fichiers
- ⚠️ Nécessite de mettre à jour les références dans Epic 1

---

### Option B: Garder Stories Existantes, Créer Nouvelles avec Numéros Différents

**Action:**
1. Garder `1.9.settings-management-api.md` et `1.10.campaign-management-api.md`
2. Créer nouvelles stories:
   - `1.11.linkedin-warmup-workflow.md`
   - `1.12.daily-prospect-detection-filtering.md`

**Avantages:**
- ✅ Pas besoin de renommer fichiers existants
- ✅ Plus rapide

**Inconvénients:**
- ⚠️ Logique de numérotation moins claire (warm-up et detection après management APIs)
- ⚠️ Ne respecte pas l'ordre logique du pivot

---

### Option C: Fusionner les Stories API dans Epic 5

**Action:**
1. Déplacer `1.9.settings-management-api.md` → `5.x.settings-management-api.md` (Epic 5)
2. Déplacer `1.10.campaign-management-api.md` → `5.x.campaign-management-api.md` (Epic 5)
3. Créer nouvelles stories 1.9 et 1.10 selon le pivot

**Avantages:**
- ✅ Stories API logiquement dans Epic 5 (Onboarding & Dashboard UX)
- ✅ Epic 1 reste focalisé sur les core features

**Inconvénients:**
- ⚠️ Nécessite de déplacer 2 fichiers
- ⚠️ Nécessite de mettre à jour Epic 5

---

## 🎯 Recommandation

**Option A** est la meilleure solution car:
1. Les stories Settings et Campaigns sont des APIs de gestion, logiquement après les core features
2. Les stories Warm-up et Detection sont des core features du pivot "No Spray No Pray"
3. L'ordre logique est: Infrastructure (1.1) → Core Features (1.2-1.8, 1.9-1.10) → Management APIs (1.11-1.12)

---

## 📋 Plan d'Action (Option A)

1. [ ] Renommer `docs/stories/1.9.settings-management-api.md` → `docs/stories/1.11.settings-management-api.md`
2. [ ] Renommer `docs/stories/1.10.campaign-management-api.md` → `docs/stories/1.12.campaign-management-api.md`
3. [ ] Mettre à jour les références dans `docs/prd/epic-1-foundation-micro-mvp-core-linkedin-scraping-email-basic-ai-agent.md`
4. [ ] Créer `docs/stories/1.9.linkedin-warmup-workflow.md`
5. [ ] Créer `docs/stories/1.10.daily-prospect-detection-filtering.md`
6. [ ] Mettre à jour `PHASE1_RECONCILIATION_COMPLETE.md` avec les nouveaux numéros

---

**Action Requise:** Valider avec Product Owner quelle option préférer.


