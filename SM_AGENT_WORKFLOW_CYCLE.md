# Workflow SM Agent - Cycle Itératif pour Toutes les Stories

**Date:** 11 Janvier 2025  
**Clarification:** Le SM Agent doit être appelé pour **chaque story**, pas seulement la première

---

## 🔄 Cycle de Développement BMad Core

### Process Standard (Workflow BMad)

```
Pour chaque Story:
  1. SM Agent → Draft/Affiner la story
  2. PO Agent (optionnel) → Valider la story
  3. Dev Agent → Implémenter la story
  4. QA Agent → Review qualité
  5. SM Agent → Draft/Affiner la PROCHAINE story
  6. (Répéter)
```

---

## 📋 Rôle du SM Agent dans le Cycle

### Le SM Agent est appelé **AVANT chaque story**

**Actions du SM pour chaque story:**
1. ✅ **Review les notes Dev/QA de la story précédente**
   - Apprendre des leçons de la story précédente
   - Identifier les patterns à réutiliser
   - Noter les problèmes à éviter

2. ✅ **Draft/Affiner la prochaine story**
   - Créer ou affiner la story depuis Epic shardée + Architecture
   - Préparer les tasks détaillées pour le Dev
   - Valider avec checklist story draft

3. ✅ **Préparer le handoff au Dev**
   - S'assurer que la story est "crystal-clear"
   - Que les tasks sont actionnables
   - Que les dependencies sont claires

---

## 🎯 Pourquoi Appeler SM pour Toutes les Stories ?

### 1. **Apprentissage Itératif**
- Le SM apprend de chaque story précédente
- Améliore les stories suivantes
- Évite de répéter les mêmes erreurs

### 2. **Validation Continue**
- Chaque story est validée avant le Dev
- Checklist story draft pour chaque story
- Cohérence entre toutes les stories

### 3. **Préparation Optimale**
- Tasks affinées selon les retours précédents
- Dependencies clarifiées
- Handoff au Dev optimisé

### 4. **Workflow BMad Standard**
- Process standardisé pour qualité
- Respect du cycle itératif
- Traçabilité complète

---

## 📊 Cycle Complet pour Epic 1

### Story 1.2.1 (Migration PhantomBuster → UniPil)
```
1. SM Agent → Affiner Story 1.2.1
2. Dev Agent → Implémenter Story 1.2.1
3. QA Agent → Review Story 1.2.1
```

### Story 1.2 (LinkedIn Scraping avec UniPil)
```
1. SM Agent → Review notes Story 1.2.1 + Affiner Story 1.2
2. Dev Agent → Implémenter Story 1.2
3. QA Agent → Review Story 1.2
```

### Story 1.3 (AI Enrichment)
```
1. SM Agent → Review notes Story 1.2 + Affiner Story 1.3
2. Dev Agent → Implémenter Story 1.3
3. QA Agent → Review Story 1.3
```

### Story 1.5.1 (Migration Instantly → SMTP)
```
1. SM Agent → Review notes précédentes + Affiner Story 1.5.1
2. Dev Agent → Implémenter Story 1.5.1
3. QA Agent → Review Story 1.5.1
```

### (Et ainsi de suite pour toutes les stories...)

---

## 🔍 État Actuel de Tes Stories

**Stories existantes (14 stories):**
- ✅ Story 1.1 (Done)
- ⏳ Story 1.2.1 (Draft - à affiner par SM)
- ⏳ Story 1.2 (Draft - à affiner par SM)
- ⏳ Story 1.3 (Draft - à affiner par SM)
- ⏳ Story 1.4 (Draft - à affiner par SM)
- ⏳ Story 1.5.1 (Draft - à affiner par SM)
- ⏳ Story 1.5 (Draft - à affiner par SM)
- ⏳ Story 1.6 (Draft - à affiner par SM)
- ⏳ Story 1.7 (Draft - à affiner par SM)
- ⏳ Story 1.8 (Draft - à affiner par SM)
- ⏳ Story 1.9 (Draft - à affiner par SM)
- ⏳ Story 1.10 (Draft - à affiner par SM)
- ✅ Story 1.11 (Ready for Review - déjà validée)
- ✅ Story 1.12 (Ready for Review - déjà validée)

---

## 🎯 Options pour le SM Agent

### Option A: SM Agent Review Séquentiel (Workflow BMad Standard)

**Process:**
1. SM Agent → Story 1.2.1 (affiner)
2. Dev Agent → Story 1.2.1 (implémenter)
3. QA Agent → Story 1.2.1 (review)
4. **SM Agent → Story 1.2** (affiner avec notes de 1.2.1)
5. Dev Agent → Story 1.2 (implémenter)
6. ...

**Avantages:**
- ✅ Apprentissage itératif
- ✅ Validation continue
- ✅ Respect du workflow BMad

**Inconvénients:**
- ⏱️ Plus de temps (mais meilleure qualité)

---

### Option B: SM Agent Batch Review (Toutes les Stories d'un coup)

**Process:**
1. SM Agent → Review/Affiner toutes les stories Epic 1
2. Puis Dev Agent → Implémenter séquentiellement

**Avantages:**
- ⚡ Plus rapide
- ✅ Vue d'ensemble complète
- ✅ Cohérence entre toutes les stories

**Inconvénients:**
- ⚠️ Pas d'apprentissage itératif
- ⚠️ Pas de review après chaque story

---

### Option C: SM Agent Sélectif (Stories Critiques Seulement)

**Process:**
1. SM Agent → Story 1.2.1 (critique)
2. Dev Agent → Story 1.2.1
3. SM Agent → Story 1.5.1 (critique)
4. Dev Agent → Story 1.5.1
5. Dev Agent → Autres stories (directement)

**Avantages:**
- ⚡ Équilibre vitesse/qualité
- ✅ Focus sur stories critiques

**Inconvénients:**
- ⚠️ Pas de review pour toutes les stories

---

## 💡 Ma Recommandation

### Option Recommandée: **Option A - SM Agent Séquentiel**

**Raisonnement:**
1. **Respect du workflow BMad** - Process standardisé
2. **Apprentissage itératif** - Chaque story améliore la suivante
3. **Validation continue** - Qualité assurée à chaque étape
4. **Meilleure qualité finale** - Moins de bugs, meilleure cohérence

**Mais si tu veux aller plus vite:**
- Option B (Batch Review) est acceptable pour les stories non-critiques
- Option C (Sélectif) pour les stories critiques seulement

---

## 🚀 Plan d'Action Recommandé

### Phase 1: Stories de Migration (Priorité 1)
```
SM → Story 1.2.1 → Dev → QA → SM → Story 1.5.1 → Dev → QA
```

### Phase 2: Stories Fondamentales (Priorité 2)
```
SM → Story 1.2 → Dev → QA → SM → Story 1.3 → Dev → QA → ...
```

### Phase 3: Stories Autres (Priorité 3)
```
SM → Story 1.4 → Dev → QA → SM → Story 1.6 → Dev → QA → ...
```

---

## 📝 Commandes SM Agent

### Pour Affiner une Story Spécifique:
```
@sm
Je veux affiner Story 1.2.1 (Migration PhantomBuster → UniPil) avant de passer au Dev Agent.
```

### Pour Review Toutes les Stories Epic 1:
```
@sm
Je veux review et affiner toutes les stories Epic 1 pour m'assurer qu'elles sont prêtes pour le Dev Agent.
```

### Pour Utiliser la Checklist Story Draft:
```
@sm
*story-checklist docs/stories/1.2.1.migration-phantombuster-to-unipil.md
```

---

**Document créé:** 11 Janvier 2025  
**Status:** Clarification workflow SM Agent - Cycle itératif pour toutes les stories





