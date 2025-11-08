# Appliquer les Migrations - Sales-Machine

## Projet
**Project ID:** `sizslvtrbuldfzaoygbs`  
**URL:** https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs

## Instructions

### Étape 1: Vérifier l'état actuel

1. Ouvrir le **SQL Editor** : https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/sql/new
2. Exécuter cette requête pour vérifier les tables existantes :
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```

### Étape 2: Si aucune table n'existe, appliquer les migrations

**IMPORTANT:** Exécuter les migrations dans l'ordre chronologique suivant :

#### Migration 1: Schema Initial
**Fichier:** `supabase/migrations/20251006000001_initial_schema.sql`
- Créer toutes les tables de base
- Créer les index
- Créer les triggers

#### Migration 2: RLS Policies
**Fichier:** `supabase/migrations/20251006000002_rls_policies.sql`
- Activer RLS sur toutes les tables
- Créer les politiques de sécurité

#### Migration 3: Seed Data
**Fichier:** `supabase/migrations/20251006000003_seed_data.sql`
- Insérer les templates système
- Créer les fonctions helper

#### Migrations suivantes (dans l'ordre chronologique)
1. `20250111_create_companies_table.sql`
2. `20250111_add_prospect_company_fields.sql`
3. `20250111_add_enrichment_fields.sql`
4. `20250111_add_template_channel_fields.sql`
5. `20250111_make_subject_line_nullable.sql`
6. `20250111_seed_linkedin_email_templates.sql`
7. `20250111_add_campaign_deliverability_fields.sql`
8. `20250111_add_domain_warmup_fields.sql`
9. `20250112_add_company_data_to_enrichment.sql`
10. `20250112_create_linkedin_warmup_tables.sql`
11. `20250113_add_ai_confidence_threshold.sql`
12. `20250113_add_settings_fields_to_users.sql`
13. `20250113_create_campaign_progress_table.sql`
14. `20250113_create_prospect_validation_queue.sql`
15. `20250114_add_vip_template_flag.sql`
16. `20250114_seed_vip_templates.sql`
17. `20250115_create_topic_blacklist.sql`
18. `20250115_seed_topic_blacklist.sql`
19. `20250115_create_blacklist_warnings.sql`
20. `20250115_create_blacklist_incidents.sql`

### Étape 3: Vérification finale

Après avoir appliqué toutes les migrations, vérifier :

```sql
-- Compter les tables
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vérifier les templates système
SELECT COUNT(*) as template_count 
FROM email_templates 
WHERE is_system_template = true;

-- Vérifier la blacklist système
SELECT COUNT(*) as blacklist_count 
FROM topic_blacklist 
WHERE user_id IS NULL;
```

## Résultat Attendu

- **14 tables** créées
- **13 templates système** dans `email_templates`
- **26 entrées** dans `topic_blacklist` (système)
- Toutes les politiques RLS activées

## Si les Tables Existent Déjà

Si les tables existent déjà mais ne sont pas visibles dans l'interface :

1. Vérifier les **API Settings** : https://supabase.com/dashboard/project/sizslvtrbuldfzaoygbs/settings/api
   - S'assurer que "Enable Data API" est activé
   - Vérifier que `public` est dans "Exposed schemas"

2. Rafraîchir le navigateur (Ctrl+F5 ou Cmd+Shift+R)

3. Vérifier les permissions dans le Table Editor



