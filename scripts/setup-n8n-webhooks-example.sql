-- ============================================
-- Exemple d'utilisation de la fonction setup_n8n_webhooks_for_user()
-- ============================================
-- 
-- Cette fonction configure automatiquement tous les webhooks N8N 
-- pour un utilisateur dans la table api_credentials.
--
-- La fonction a été créée via migration: setup_n8n_webhooks_function
--
-- ============================================

-- Exemple 1: Configurer les webhooks pour un utilisateur spécifique
-- Remplacez 'USER_ID_ICI' par l'ID réel de l'utilisateur
SELECT * FROM setup_n8n_webhooks_for_user('USER_ID_ICI'::uuid);

-- Exemple 2: Configurer les webhooks pour tous les utilisateurs existants
DO $$
DECLARE
  user_record RECORD;
  result_count INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT id, email FROM auth.users
  LOOP
    PERFORM setup_n8n_webhooks_for_user(user_record.id);
    result_count := result_count + 1;
    RAISE NOTICE '✅ Webhooks N8N configurés pour l''utilisateur: % (%)', user_record.email, user_record.id;
  END LOOP;
  
  RAISE NOTICE '📊 Total: % utilisateurs configurés', result_count;
END $$;

-- Exemple 3: Vérifier les webhooks configurés pour un utilisateur
SELECT 
  u.email,
  ac.service_name,
  ac.webhook_url,
  ac.is_active,
  ac.metadata->>'description' as description,
  ac.metadata->>'workflow_id' as workflow_id,
  ac.created_at,
  ac.updated_at
FROM api_credentials ac
JOIN auth.users u ON ac.user_id = u.id
WHERE ac.service_name LIKE 'n8n_%'
  AND u.id = 'USER_ID_ICI'::uuid  -- Remplacer par l'ID de l'utilisateur
ORDER BY ac.service_name;

-- Exemple 4: Vérifier tous les webhooks N8N configurés (tous utilisateurs)
SELECT 
  u.email,
  ac.service_name,
  ac.webhook_url,
  ac.is_active,
  ac.metadata->>'description' as description,
  ac.metadata->>'workflow_id' as workflow_id,
  ac.created_at,
  ac.updated_at
FROM api_credentials ac
JOIN auth.users u ON ac.user_id = u.id
WHERE ac.service_name LIKE 'n8n_%'
ORDER BY u.email, ac.service_name;

-- Exemple 5: Compter les webhooks par utilisateur
SELECT 
  u.email,
  COUNT(*) as webhook_count,
  COUNT(*) FILTER (WHERE ac.is_active = true) as active_count,
  COUNT(*) FILTER (WHERE ac.is_active = false) as inactive_count
FROM api_credentials ac
JOIN auth.users u ON ac.user_id = u.id
WHERE ac.service_name LIKE 'n8n_%'
GROUP BY u.email, u.id
ORDER BY u.email;



