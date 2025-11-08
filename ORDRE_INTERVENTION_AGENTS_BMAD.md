# Ordre d'Intervention des Agents BMad Core

**Date:** 11 Janvier 2025  
**Contexte:** Workflow complet BMad Core pour projet "No Spray No Pray"

---

## 📋 Vue d'Ensemble

BMad Core utilise **10 agents spécialisés** dans un workflow séquentiel en 2 phases principales :
1. **Phase Planning** (Web UI ou IDE) - Création des documents
2. **Phase Development** (IDE) - Implémentation itérative

---

## 🔄 Phase 1: Planning Workflow (Web UI ou IDE)

### Ordre Séquentiel des Agents

#### 1. **Analyst Agent** (Optionnel - si pas de Project Brief)
**Rôle:** Business Analyst  
**Quand:** Début du projet, si tu n'as pas de Project Brief  
**Actions:**
- Brainstorming
- Market Research
- Competitor Analysis
- **Output:** Project Brief

**Commandes:**
- `*help` pour voir les commandes disponibles

---

#### 2. **PM Agent** (John) ⭐ **CRÉATEUR DU PRD**
**Rôle:** Product Manager  
**Quand:** Après Project Brief (ou directement si tu as déjà un brief)  
**Actions:**
- Créer le PRD (Product Requirements Document)
- Définir les FRs (Functional Requirements) et NFRs (Non-Functional Requirements)
- Créer les Epics et Stories
- **Output:** `docs/prd.md` avec Epics et Stories

**Commandes principales:**
- `*create-prd` - Créer le PRD
- `*create-epic` - Créer des épics
- `*create-story` - Créer des stories
- `*shard-prd` - Découper le PRD (mais le PO fait ça normalement)

**⚠️ Important:** C'est l'agent que tu utilises actuellement (moi) pour créer la documentation produit.

---

#### 3. **UX Expert Agent** (Optionnel - si UI/UX requis)
**Rôle:** UX Designer  
**Quand:** Après PRD, si le projet a une interface utilisateur  
**Actions:**
- Créer les spécifications Front End
- Générer des prompts UI pour Lovable/V0 (optionnel)
- **Output:** UX Spec + UI prompts (optionnel)

**Commandes:**
- `*help` pour voir les commandes disponibles

---

#### 4. **Architect Agent** ⭐ **CRÉATEUR DE L'ARCHITECTURE**
**Rôle:** Solution Architect  
**Quand:** Après PRD (+ UX Spec si disponible)  
**Actions:**
- Créer l'Architecture document
- Définir la stack technique
- Concevoir les schémas de base de données
- Définir les workflows N8N
- **Output:** `docs/architecture.md`

**Commandes principales:**
- `*create-architecture` - Créer l'architecture
- `*document-project` - Documenter un projet existant (brownfield)

**✅ Note:** Tu as déjà utilisé cet agent pour réviser l'architecture "No Spray No Pray".

---

#### 5. **QA Agent** (Optionnel - Early Test Strategy)
**Rôle:** QA Specialist  
**Quand:** Après Architecture, pour identifier les risques tôt  
**Actions:**
- Early Test Architecture Input sur les zones à haut risque
- Identifier les risques de régression
- **Output:** Test Strategy initiale

**Commandes:**
- `*risk` - Identifier les risques de régression
- `*design` - Créer la stratégie de test

---

#### 6. **PO Agent** (Sarah) ⭐ **VALIDATEUR & SHARDER**
**Rôle:** Product Owner & Process Steward  
**Quand:** Après Architecture (+ QA si fait)  
**Actions:**
- **Exécuter le Master Checklist** (`*execute-checklist-po`) - Valider la cohérence PRD + Architecture
- Si documents alignés → **Sharder les documents** (`*shard-doc`)
  - PRD → Epics → Stories
  - Architecture → Sections shardées
- **Output:** 
  - Validation report
  - `docs/epics/` (épics shardées)
  - `docs/stories/` (stories shardées)

**Commandes principales:**
- `*execute-checklist-po` - **MASTER CHECKLIST** (validation complète)
- `*shard-doc docs/prd.md prd` - Sharder le PRD
- `*shard-doc docs/architecture.md arch` - Sharder l'Architecture
- `*validate-story-draft {story}` - Valider une story draft

**⚠️ CRITIQUE:** C'est le dernier agent de la phase Planning. Une fois qu'il a shardé les documents, tu passes à la phase Development.

---

## 🔄 Phase 2: Development Workflow (IDE uniquement)

### Cycle de Développement Itératif (répété pour chaque Story)

#### 7. **SM Agent** (Scrum Master) ⭐ **CRÉATEUR DE STORIES**
**Rôle:** Scrum Master  
**Quand:** Début de chaque nouvelle story  
**Actions:**
- Review les notes Dev/QA de la story précédente
- **Draft la prochaine story** depuis l'Epic shardée + Architecture
- Préparer les tasks pour le Dev
- **Output:** Story draft avec tasks détaillées

**Commandes:**
- `*create-story` - Créer une story depuis un epic
- `*help` pour voir les commandes

**⚠️ Note:** Dans ton projet, tu as déjà des stories créées. Le SM peut les affiner ou créer de nouvelles stories.

---

#### 8. **QA Agent** (Optionnel - High-Risk Story)
**Rôle:** QA Specialist  
**Quand:** Après story draft, si story à haut risque  
**Actions:**
- `*risk` - Identifier les risques de régression
- `*design` - Créer la stratégie de test pour cette story
- **Output:** Test Strategy & Risk Profile

**Commandes:**
- `*risk` - Analyse des risques
- `*design` - Stratégie de test

---

#### 9. **PO Agent** (Sarah) (Optionnel - Validation Story)
**Rôle:** Product Owner  
**Quand:** Après story draft (optionnel, mais recommandé)  
**Actions:**
- `*validate-story-draft {story}` - Valider la story contre PRD/Architecture
- Vérifier la cohérence avec les artefacts
- **Output:** Validation report

**Commandes:**
- `*validate-story-draft docs/stories/1.2.linkedin-profile-scraping-workflow.md`

---

#### 10. **Dev Agent** ⭐ **IMPLÉMENTATEUR**
**Rôle:** Developer  
**Quand:** Après validation/approbation de la story  
**Actions:**
- Exécuter les tasks séquentiellement
- Implémenter le code
- Écrire les tests
- Run validations (linting, tests)
- Marquer "Ready for Review" avec notes
- **Output:** Code implémenté + tests

**Commandes:**
- `*help` pour voir les commandes disponibles
- Implémente les tasks de la story

**⚠️ C'est l'agent principal du développement.**

---

#### 11. **QA Agent** (Optionnel - Mid-Dev Checkpoint)
**Rôle:** QA Specialist  
**Quand:** Pendant le développement (milieu de story)  
**Actions:**
- `*trace` - Vérifier la couverture des tests et points d'intégration
- `*nfr` - Valider les NFRs (performance, etc.)
- **Output:** Gaps à combler

**Commandes:**
- `*trace` - Traceability matrix
- `*nfr` - Validation NFRs

---

#### 12. **QA Agent** (Recommandé - Post-Implementation)
**Rôle:** QA Specialist  
**Quand:** Après "Ready for Review" du Dev  
**Actions:**
- **Test Architect Review** - Analyse complète du code
- **Quality Gate** - Décision qualité
- Refactoring actif si nécessaire
- **Output:** 
  - Quality Gate decision (Pass/Fail)
  - Recommendations

**Commandes:**
- `*gate` - Mettre à jour le Quality Gate status
- Review automatique du code

---

#### 13. **QA Agent** (Final - Gate Update)
**Rôle:** QA Specialist  
**Quand:** Après corrections si nécessaire  
**Actions:**
- `*gate` - Mettre à jour le status du Quality Gate
- **Output:** Quality Gate final

**Commandes:**
- `*gate` - Update gate status

---

## 📊 Résumé Visuel de l'Ordre

### Phase Planning (Web UI ou IDE)
```
1. Analyst (opt) → 2. PM → 3. UX Expert (opt) → 4. Architect → 5. QA (opt) → 6. PO
```

### Phase Development (IDE uniquement) - Cycle itératif
```
7. SM → 8. QA (opt) → 9. PO (opt) → 10. Dev → 11. QA (opt) → 12. QA → 13. QA (opt)
   ↓                                                                              ↑
   └─────────────────────────── Répété pour chaque Story ────────────────────────┘
```

---

## 🎯 Agents Meta (Spécialisés)

### **bmad-orchestrator**
**Quand utiliser:** Complex multi-role tasks, coordination entre plusieurs agents  
**Où:** Web UI uniquement (pas dans IDE)

### **bmad-master**
**Quand utiliser:** Single-session comprehensive work (toutes les capacités sans switching)  
**Où:** Web UI uniquement (pas dans IDE)

---

## 📝 Ton Projet Actuel - Où en es-tu ?

### ✅ Déjà Fait (Phase Planning)
- ✅ **PM Agent** (moi) : PRD créé, Epics définis, Stories créées
- ✅ **Architect Agent** : Architecture révisée pour "No Spray No Pray"
- ⏳ **PO Agent** : **À FAIRE** - Exécuter Master Checklist + Sharder documents

### ⏳ À Faire (Phase Development)
- ⏳ **SM Agent** : Affiner les stories existantes si nécessaire
- ⏳ **Dev Agent** : Implémenter les stories (commencer par Story 1.2)
- ⏳ **QA Agent** : Review qualité après implémentation

---

## 🚀 Prochaine Action Recommandée

**Utilise l'agent PO (Sarah) pour:**
1. Exécuter le Master Checklist: `*execute-checklist-po`
2. Valider la cohérence PRD + Architecture
3. Sharder les documents: `*shard-doc docs/prd.md prd`

**Comment activer PO Agent:**
- **Cursor:** `@po` puis `*execute-checklist-po`
- **Claude Code:** `/po` puis `*execute-checklist-po`
- **Windsurf:** `/po` puis `*execute-checklist-po`

---

## 📚 Références

- **User Guide:** `.bmad-core/user-guide.md`
- **Agent Definitions:** `.bmad-core/agents/*.md`
- **Workflow Diagrams:** Voir user-guide.md pour les diagrammes Mermaid complets

---

**Document créé:** 11 Janvier 2025  
**Status:** Guide de référence pour workflow BMad Core





