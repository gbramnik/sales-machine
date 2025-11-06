# Vérification Projet Supabase - Sales-Machine

## Problème Identifié

L'utilisateur ne voit aucune table dans l'interface Supabase Table Editor pour le projet **Sales-Machine** (`sizslvtrbuldfzaoygbs`), malgré les vérifications SQL qui montrent 14 tables.

## Configuration MCP Actuelle

### Serveur "Sales-Machine"
```json
{
  "project-ref": "sizslvtrbuldfzaoygbs",
  "SUPABASE_URL": "https://sizslvtrbuldfzaoygbs.supabase.co"
}
```

### Serveur "N8N-Sales-Machine"  
```json
{
  "project-ref": "oowpbypwihbskxajdnjd",
  "SUPABASE_URL": "https://oowpbypwihbskxajdnjd.supabase.co"
}
```

## Hypothèses

1. **Le serveur MCP se connecte au mauvais projet** malgré la configuration
2. **Les tables existent mais ne sont pas visibles** dans l'interface (problème de permissions/cache)
3. **Le projet `sizslvtrbuldfzaoygbs` n'a vraiment aucune table** et mes requêtes SQL se connectaient au mauvais projet

## Actions à Prendre

### Option 1: Vérifier directement dans Supabase Dashboard

1. Aller sur : https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/editor
2. Vérifier si les tables apparaissent
3. Si non, aller dans SQL Editor et exécuter :
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```

### Option 2: Appliquer les migrations manuellement

Si les tables n'existent vraiment pas, appliquer les migrations dans l'ordre :

1. **SQL Editor** : https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/sql/new
2. Copier-coller et exécuter dans l'ordre :
   - `supabase/migrations/20251006000001_initial_schema.sql`
   - `supabase/migrations/20251006000002_rls_policies.sql`
   - `supabase/migrations/20251006000003_seed_data.sql`
   - Puis toutes les autres migrations dans l'ordre chronologique

### Option 3: Vérifier les permissions RLS

Si les tables existent mais ne sont pas visibles, vérifier :
- Les politiques RLS sont activées
- L'utilisateur a les bonnes permissions
- Le schéma `public` est bien exposé dans les API Settings

## Prochaines Étapes

1. ✅ Vérifier dans le SQL Editor de Supabase si les tables existent
2. ⏳ Si elles n'existent pas, appliquer toutes les migrations
3. ⏳ Vérifier que le schéma `public` est bien exposé dans API Settings
4. ⏳ Vérifier les permissions RLS

