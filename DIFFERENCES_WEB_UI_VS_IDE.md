# Différences Web UI vs IDE - BMad Core

**Date:** 11 Janvier 2025  
**Contexte:** Comprendre quand utiliser Web UI vs IDE pour BMad Core

---

## 📊 Vue d'Ensemble

BMad Core fonctionne en **2 phases distinctes** avec des environnements optimaux différents :

| Phase | Environnement Optimal | Raison |
|-------|----------------------|--------|
| **Planning** | **Web UI** (recommandé) | Grand contexte, coût réduit, brainstorming |
| **Development** | **IDE** (obligatoire) | Opérations fichiers, tests, intégration |

---

## 🌐 Web UI (Phase Planning)

### Qu'est-ce que c'est ?

**Plateformes Web avec agents AI:**
- **ChatGPT** (OpenAI) - Custom GPTs
- **Claude** (Anthropic) - Claude.ai
- **Gemini** (Google) - Gemini Gem (recommandé)
- **Codex** (OpenAI) - Web interface

### Comment ça fonctionne ?

1. **Copier le fichier team** : `dist/teams/team-fullstack.txt`
2. **Créer un Custom GPT / Gemini Gem**
3. **Uploader le fichier** avec instructions
4. **Utiliser les agents** via `/help` et commandes

### ✅ Avantages

1. **Grand contexte** (1M tokens avec Gemini)
   - Peut traiter des documents complets en une fois
   - PRD + Architecture dans un seul contexte
   - Pas besoin de sharding pour la phase planning

2. **Coût réduit**
   - Web UI souvent moins cher que IDE
   - Parfait pour générer de longs documents
   - Idéal pour brainstorming et exploration

3. **Multi-agents simultanés**
   - BMad Orchestrator peut coordonner plusieurs agents
   - Brainstorming efficace
   - Exploration rapide d'options

4. **Pas de setup technique**
   - Pas besoin d'installer quoi que ce soit
   - Démarrage immédiat
   - Accessible depuis n'importe quel navigateur

### ❌ Limitations

1. **Pas d'opérations fichiers directes**
   - Ne peut pas éditer directement ton code
   - Ne peut pas exécuter de tests
   - Ne peut pas lancer de commandes terminal

2. **Pas de développement**
   - Phase Development **DOIT** être en IDE
   - Pas d'intégration avec ton projet
   - Pas de validation de code en temps réel

3. **Context switching**
   - Doit copier/coller les résultats
   - Pas de lien direct avec le repo
   - Workflow manuel

### 🎯 Quand utiliser Web UI

**✅ Utilise Web UI pour:**
- **Phase Planning complète**
  - Créer le PRD (PM Agent)
  - Créer l'Architecture (Architect Agent)
  - Brainstorming initial (Analyst Agent)
  - UX Design (UX Expert Agent)
  - Validation Master Checklist (PO Agent)

- **Projets nouveaux (Greenfield)**
  - Pas de code existant à analyser
  - Focus sur documentation

- **Exploration de concepts**
  - Brainstorming de features
  - Analyse de marché
  - Recherche compétitive

### 📋 Workflow Web UI Typique

```
1. Analyst (opt) → Brainstorming
2. PM Agent → Créer PRD
3. UX Expert (opt) → Spécifications UI
4. Architect → Créer Architecture
5. QA (opt) → Early Test Strategy
6. PO Agent → Master Checklist
7. PO Agent → Sharder documents (pour IDE)
```

**⚠️ Important:** Une fois le PO a shardé les documents, **tu DOIS passer en IDE** pour la phase Development.

---

## 💻 IDE (Phase Development)

### Qu'est-ce que c'est ?

**IDEs avec intégration AI:**
- **Cursor** - Native AI integration (recommandé)
- **Claude Code** - Anthropic's official IDE
- **Windsurf** - Built-in AI capabilities
- **Trae** - Built-in AI capabilities
- **Cline** - VS Code extension
- **Roo Code** - Web-based IDE
- **GitHub Copilot** - VS Code extension
- **Auggie CLI** - AI-powered environment

### Comment ça fonctionne ?

1. **Installation BMad Core:**
   ```bash
   npx bmad-method install
   ```
2. **Sélectionner ton IDE** (Cursor, Claude Code, etc.)
3. **Activer les agents** via commandes (`@pm`, `@dev`, etc.)
4. **Agents travaillent directement** dans ton projet

### ✅ Avantages

1. **Opérations fichiers directes**
   - Édite le code directement
   - Crée/supprime des fichiers
   - Modifie la structure du projet

2. **Tests et validation**
   - Exécute les tests
   - Lance le linting
   - Vérifie la compilation
   - Valide les builds

3. **Intégration complète**
   - Accès direct au repo Git
   - Context du projet entier
   - Compréhension du code existant

4. **Workflow fluide**
   - Pas de copier/coller
   - Résultats directement dans le projet
   - Validation en temps réel

5. **Phase Development complète**
   - SM Agent → Créer stories
   - Dev Agent → Implémenter
   - QA Agent → Review qualité
   - Cycle itératif complet

### ❌ Limitations

1. **Contexte limité**
   - Limites de tokens selon l'IDE
   - Nécessite sharding pour gros documents
   - Peut nécessiter plusieurs conversations

2. **Coût potentiellement plus élevé**
   - Selon l'IDE et le modèle utilisé
   - Plus de tokens consommés avec opérations fichiers

3. **Setup initial**
   - Installation nécessaire
   - Configuration IDE spécifique
   - Courbe d'apprentissage

### 🎯 Quand utiliser IDE

**✅ Utilise IDE pour:**
- **Phase Development complète**
  - SM Agent → Stories
  - Dev Agent → Implémentation
  - QA Agent → Reviews

- **Projets existants (Brownfield)**
  - Analyse du code existant
  - Documenter le projet
  - Ajouter des features

- **Opérations de code**
  - Écriture de code
  - Tests
  - Refactoring
  - Debugging

### 📋 Workflow IDE Typique

```
1. SM Agent → Draft story
2. PO Agent (opt) → Valider story
3. Dev Agent → Implémenter
4. QA Agent (opt) → Mid-Dev checkpoint
5. QA Agent → Test Architect Review
6. Répéter pour chaque story
```

---

## 🔄 Transition Web UI → IDE

### Point Critique

**Une fois le PO Agent a shardé les documents, tu DOIS passer en IDE.**

### Étapes de Transition

1. **Copier les documents** dans ton projet:
   - `docs/prd.md` (ou fichiers shardés)
   - `docs/architecture.md`
   - `docs/epics/` (épics shardées)
   - `docs/stories/` (stories shardées)

2. **Ouvrir ton IDE** (Cursor, Claude Code, etc.)

3. **Installer BMad Core** (si pas déjà fait):
   ```bash
   npx bmad-method install
   ```

4. **Commencer Phase Development** avec SM Agent

---

## 📊 Comparaison Directe

| Aspect | Web UI | IDE |
|--------|--------|-----|
| **Phase Planning** | ✅ Idéal | ⚠️ Possible mais moins optimal |
| **Phase Development** | ❌ Impossible | ✅ Obligatoire |
| **Contexte** | ✅ Très grand (1M tokens) | ⚠️ Limité (selon IDE) |
| **Coût** | ✅ Généralement moins cher | ⚠️ Peut être plus cher |
| **Opérations fichiers** | ❌ Non | ✅ Oui |
| **Tests** | ❌ Non | ✅ Oui |
| **Intégration Git** | ❌ Non | ✅ Oui |
| **Brainstorming** | ✅ Excellent | ⚠️ Possible |
| **Implémentation** | ❌ Non | ✅ Oui |
| **Setup** | ✅ Aucun | ⚠️ Installation requise |

---

## 🎯 Recommandation pour Ton Projet

### ✅ Tu as déjà fait (Web UI ou IDE)
- PM Agent (moi) → PRD créé
- Architect Agent → Architecture révisée

### ⏳ Prochaine étape (IDE recommandé)
- **PO Agent** → Master Checklist + Sharding
  - Peut être fait en IDE (tu es déjà dans Cursor)
  - Ou en Web UI si tu préfères (Gemini Gem)

### 🚀 Après (IDE obligatoire)
- **SM Agent** → Affiner stories
- **Dev Agent** → Implémenter Story 1.2
- **QA Agent** → Review qualité

---

## 💡 Tips Pratiques

### Pour Web UI
- **Utilise Gemini 2.5 Pro** pour le grand contexte (1M tokens)
- **Copie les résultats** dans ton projet après chaque session
- **Utilise BMad Orchestrator** pour coordonner plusieurs agents
- **Focus sur documentation** (PRD, Architecture, UX)

### Pour IDE
- **Utilise Cursor** ou **Claude Code** pour meilleure intégration
- **Commence nouvelle conversation** pour chaque agent (clean context)
- **Commit souvent** après chaque story complétée
- **Utilise SM Agent** pour créer les stories avant Dev

---

## 📚 Références

- **User Guide:** `.bmad-core/user-guide.md`
- **Web UI Setup:** `dist/teams/team-fullstack.txt`
- **IDE Installation:** `npx bmad-method install`
- **Workflow Diagrams:** Voir user-guide.md

---

**Document créé:** 11 Janvier 2025  
**Status:** Guide de référence pour choisir Web UI vs IDE


