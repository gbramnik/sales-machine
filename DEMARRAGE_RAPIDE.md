# 🚀 Démarrage Rapide - Sales Machine

## Configuration en 5 Minutes

### Étape 1: Récupérer la Clé Supabase (2 min)

1. Ouvrez votre projet Supabase:
   ```
   https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/settings/api
   ```

2. Copiez la clé **`service_role`** (la clé secrète qui commence par `eyJhbGc...`)

3. Ouvrez le fichier `apps/api/.env` et remplacez:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   par:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...votre-clé-complète
   ```

### Étape 2: Appliquer les Migrations SQL (2 min)

1. Ouvrez le SQL Editor de Supabase:
   ```
   https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/sql/new
   ```

2. **Migration 1 - Schema Initial:**
   - Ouvrez le fichier `supabase/migrations/20251006000001_initial_schema.sql`
   - Copiez TOUT le contenu (Cmd+A, Cmd+C)
   - Collez dans le SQL Editor
   - Cliquez sur **Run** (ou Cmd+Enter)
   - ✅ Attendez "Success"

3. **Migration 2 - RLS Policies:**
   - Nouvelle query (cliquez sur `+ New query`)
   - Ouvrez le fichier `supabase/migrations/20251006000002_rls_policies.sql`
   - Copiez tout, collez, **Run**
   - ✅ Attendez "Success"

4. **Migration 3 - Seed Data:**
   - Nouvelle query
   - Ouvrez le fichier `supabase/migrations/20251006000003_seed_data.sql`
   - Copiez tout, collez, **Run**
   - ✅ Attendez "Success"

5. **Vérification:**
   - Allez dans Table Editor: https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/editor
   - Vous devriez voir 9 tables
   - Ouvrez `email_templates` → vous devriez voir 5 templates

### Étape 3: Démarrer l'Application (30 sec)

```bash
# Dans le terminal, à la racine du projet:
npm run dev
```

Cela démarre:
- ✅ Frontend sur http://localhost:5173
- ✅ Backend API sur http://localhost:3000

### Étape 4: Tester l'API (30 sec)

Ouvrez un nouveau terminal et testez:

```bash
# Test de santé
curl http://localhost:3000/health

# Devrait retourner:
# {"status":"ok","timestamp":"2025-10-06T...","uptime":...}
```

## 🎉 C'est Prêt!

Votre application Sales Machine est maintenant configurée et fonctionnelle!

### Prochaines Étapes

1. **Configurer l'authentification:**
   - Google OAuth: https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/auth/providers
   - LinkedIn OAuth: https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/auth/providers

2. **Créer votre premier utilisateur:**
   - Via le frontend: http://localhost:5173
   - Ou directement dans Supabase: https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/auth/users

3. **Explorer l'API:**
   - Documentation des endpoints: Voir `apps/api/src/routes/`
   - Health check: `GET /health`
   - User endpoints: `GET /users/me`
   - Dashboard: `GET /dashboard/stats`
   - Prospects: `GET /prospects`
   - AI Review Queue: `GET /ai-review-queue`

## 📚 Documentation Complète

- **MIGRATION_GUIDE.md** - Guide détaillé de migration Supabase
- **README.md** - Documentation complète du projet
- **apps/api/README.md** - Documentation de l'API

## 🆘 Besoin d'Aide?

### Problèmes Courants

**Le serveur API ne démarre pas:**
```bash
# Vérifiez que la SERVICE_ROLE_KEY est correcte dans apps/api/.env
cat apps/api/.env | grep SERVICE_ROLE_KEY
```

**Erreur "relation does not exist":**
- Vérifiez que les 3 migrations ont été exécutées
- Rechargez le Table Editor

**Erreur de connexion Supabase:**
```bash
# Testez la connexion directement
curl https://sizslvtrbuldfzaoygbs.supabase.co/rest/v1/
```

### Logs

```bash
# Logs du backend
npm run dev:api

# Logs du frontend
npm run dev:web

# Les deux en même temps
npm run dev
```

## 🛠️ Scripts Utiles

```bash
# Développement
npm run dev              # Frontend + Backend
npm run dev:api          # Backend seulement
npm run dev:web          # Frontend seulement

# Build
npm run build            # Build tout
npm run build:api        # Build backend
npm run build:web        # Build frontend

# Tests
npm run test             # Tous les tests
npm run test:api         # Tests backend
npm run test:web         # Tests frontend

# Type checking
npm run type-check       # Vérifier les types TypeScript

# Linting
npm run lint             # Linter le code
npm run lint:fix         # Corriger automatiquement
```

## 🎯 Fonctionnalités Prêtes

✅ **Backend API:**
- Authentification JWT avec Supabase
- Routes utilisateurs (CRUD)
- Routes prospects (CRUD avec enrichissement)
- Dashboard avec statistiques
- Queue de révision AI
- RLS policies pour multi-tenant
- Gestion d'erreurs centralisée
- Logging structuré

✅ **Base de données:**
- 9 tables configurées
- RLS policies actives
- 5 email templates pré-créés
- Fonctions helpers (health score, stats, etc.)
- Triggers pour updated_at
- Indexes pour performance

✅ **Configuration:**
- TypeScript configuré
- ESLint + Prettier
- Monorepo avec npm workspaces
- Hot reload (tsx watch)
- Variables d'environnement

## 🚧 À Faire Ensuite

1. [ ] Configurer OAuth (Google, LinkedIn)
2. [ ] Implémenter le frontend React
3. [ ] Connecter Claude API pour l'enrichissement
4. [ ] Configurer N8N pour les webhooks
5. [ ] Ajouter les tests
6. [ ] Déployer sur Railway

Bon développement! 🚀
