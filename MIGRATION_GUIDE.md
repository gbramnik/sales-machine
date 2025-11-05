# Guide de Migration Supabase

## Étape 1: Créer le Projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Cliquez sur "New Project"
3. Sélectionnez votre organisation
4. Remplissez les informations:
   - **Name**: Sales Machine
   - **Database Password**: Choisissez un mot de passe fort et notez-le
   - **Region**: EU West (Paris) - `eu-west-3`
   - **Pricing Plan**: Free ou Pro selon vos besoins

5. Attendez que le projet soit créé (2-3 minutes)

## Étape 2: Récupérer les Clés API

1. Une fois le projet créé, allez dans **Settings** > **API**
2. Notez les informations suivantes:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **anon public key**: Commence par `eyJhbGc...`
   - **service_role key**: Commence par `eyJhbGc...` (différent de l'anon key)

## Étape 3: Appliquer les Migrations SQL

### Via le Dashboard (Recommandé)

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**
3. Nommez la query: `01 - Initial Schema`

4. **Migration 1 - Schema Initial:**
   - Ouvrez le fichier `supabase/migrations/20251006000001_initial_schema.sql`
   - Copiez tout le contenu
   - Collez-le dans le SQL Editor
   - Cliquez sur **Run** (ou Cmd+Enter)
   - Vérifiez qu'il n'y a pas d'erreurs

5. **Migration 2 - RLS Policies:**
   - Créez une nouvelle query: `02 - RLS Policies`
   - Ouvrez le fichier `supabase/migrations/20251006000002_rls_policies.sql`
   - Copiez tout le contenu
   - Collez-le dans le SQL Editor
   - Cliquez sur **Run**

6. **Migration 3 - Seed Data:**
   - Créez une nouvelle query: `03 - Seed Data`
   - Ouvrez le fichier `supabase/migrations/20251006000003_seed_data.sql`
   - Copiez tout le contenu
   - Collez-le dans le SQL Editor
   - Cliquez sur **Run**

## Étape 4: Vérifier les Tables

1. Allez dans **Table Editor**
2. Vous devriez voir les tables suivantes:
   - users
   - campaigns
   - prospects
   - prospect_enrichment
   - email_templates
   - ai_conversation_log
   - meetings
   - ai_review_queue
   - audit_log

3. Cliquez sur `email_templates` - vous devriez voir 5 templates pré-créés

## Étape 5: Mettre à Jour les Variables d'Environnement

1. Ouvrez le fichier `apps/api/.env`
2. Remplacez les valeurs par celles de votre projet:

```bash
# Supabase Configuration
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...votre-service-role-key

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info
FRONTEND_URL=http://localhost:5173
```

3. **⚠️ IMPORTANT:** Ne commitez JAMAIS la `SERVICE_ROLE_KEY` dans Git!

## Étape 6: Générer les Types TypeScript (Optionnel mais Recommandé)

Une fois les migrations appliquées, générez les types TypeScript depuis votre schéma:

```bash
npx supabase gen types typescript --project-id [your-project-ref] > packages/shared/src/types/database.generated.ts
```

## Étape 7: Tester la Connexion

Démarrez le serveur API:

```bash
npm run dev:api
```

Testez l'endpoint de santé:

```bash
curl http://localhost:3000/health
```

Vous devriez voir:
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T...",
  "uptime": 1.234
}
```

## Dépannage

### Erreur: "relation does not exist"
- Vérifiez que toutes les migrations ont été exécutées dans l'ordre
- Rechargez la page du Table Editor

### Erreur: "insufficient privileges"
- Assurez-vous d'utiliser la `SERVICE_ROLE_KEY` et non l'`ANON_KEY` pour les opérations côté serveur

### Erreur de connexion
- Vérifiez que l'URL et les clés sont correctes dans `.env`
- Vérifiez que le projet Supabase est actif (pas en pause)

### Les RLS policies bloquent les requêtes
- Les policies RLS nécessitent un JWT valide avec `auth.uid()`
- Pour les tests, vous pouvez temporairement désactiver RLS sur une table (⚠️ à réactiver ensuite!)

## Prochaines Étapes

Une fois les migrations appliquées:
1. ✅ Configurez l'authentification (Google OAuth, LinkedIn OAuth)
2. ✅ Testez les endpoints API
3. ✅ Configurez le frontend pour se connecter à l'API
4. ✅ Créez votre premier utilisateur

## Support

Si vous rencontrez des problèmes:
- Documentation Supabase: https://supabase.com/docs
- Vérifiez les logs dans le Dashboard Supabase > Logs
- Consultez le README.md du projet
