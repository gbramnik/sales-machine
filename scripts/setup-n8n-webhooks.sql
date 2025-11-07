-- Script SQL pour configurer les webhooks N8N dans api_credentials
-- 
-- Usage:
--   1. Remplacer <USER_ID> par l'ID de l'utilisateur
--   2. Exécuter dans Supabase SQL Editor ou via psql
--
-- Note: Ce script utilise INSERT ... ON CONFLICT pour créer ou mettre à jour les webhooks

-- ============================================
-- Configuration des Webhooks N8N
-- ============================================

-- LinkedIn Profile Scraper
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active, metadata)
VALUES (
  '<USER_ID>'::uuid,
  'n8n_linkedin_scrape',
  'https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper',
  true,
  jsonb_build_object(
    'workflow_id', 'bSH0ds0r0PEyxIsv',
    'description', 'LinkedIn Profile Scraper',
    'configured_at', now()
  )
)
ON CONFLICT (user_id, service_name) 
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = true,
  updated_at = now(),
  metadata = EXCLUDED.metadata;

-- AI-Powered Contextual Enrichment
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active, metadata)
VALUES (
  '<USER_ID>'::uuid,
  'n8n_ai_enrichment',
  'https://n8n.srv997159.hstgr.cloud/webhook/ai-enrichment',
  true,
  jsonb_build_object(
    'workflow_id', 'DG6jPgRIP4KgrAKl',
    'description', 'AI-Powered Contextual Enrichment',
    'configured_at', now()
  )
)
ON CONFLICT (user_id, service_name) 
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = true,
  updated_at = now(),
  metadata = EXCLUDED.metadata;

-- AI Conversation Agent (Email Reply)
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active, metadata)
VALUES (
  '<USER_ID>'::uuid,
  'n8n_email_reply',
  'https://n8n.srv997159.hstgr.cloud/webhook/smtp/email-reply',
  true,
  jsonb_build_object(
    'workflow_id', 'TZBWM2CaRWzUUPiS',
    'description', 'AI Conversation Agent (Email Reply)',
    'configured_at', now()
  )
)
ON CONFLICT (user_id, service_name) 
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = true,
  updated_at = now(),
  metadata = EXCLUDED.metadata;

-- AI Conversation Agent (LinkedIn Reply)
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active, metadata)
VALUES (
  '<USER_ID>'::uuid,
  'n8n_ai_conversation',
  'https://n8n.srv997159.hstgr.cloud/webhook/unipil/linkedin-reply',
  true,
  jsonb_build_object(
    'workflow_id', 'TZBWM2CaRWzUUPiS',
    'description', 'AI Conversation Agent (LinkedIn Reply)',
    'configured_at', now()
  )
)
ON CONFLICT (user_id, service_name) 
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = true,
  updated_at = now(),
  metadata = EXCLUDED.metadata;

-- Meeting Booking Webhook
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active, metadata)
VALUES (
  '<USER_ID>'::uuid,
  'n8n_meeting_booking',
  'https://n8n.srv997159.hstgr.cloud/webhook/meeting-booking',
  true,
  jsonb_build_object(
    'workflow_id', 'iwI4yZbkNXbYjrgj',
    'description', 'Meeting Booking Webhook',
    'configured_at', now()
  )
)
ON CONFLICT (user_id, service_name) 
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = true,
  updated_at = now(),
  metadata = EXCLUDED.metadata;

-- Domain Verification
INSERT INTO api_credentials (user_id, service_name, webhook_url, is_active, metadata)
VALUES (
  '<USER_ID>'::uuid,
  'n8n_domain_verification',
  'https://n8n.srv997159.hstgr.cloud/webhook/domain-verification',
  true,
  jsonb_build_object(
    'workflow_id', 'JFJ6dZZcm6CpXkVZ',
    'description', 'Domain Verification',
    'configured_at', now()
  )
)
ON CONFLICT (user_id, service_name) 
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = true,
  updated_at = now(),
  metadata = EXCLUDED.metadata;

-- Vérification
SELECT 
  service_name,
  webhook_url,
  is_active,
  metadata->>'description' as description,
  metadata->>'workflow_id' as workflow_id,
  created_at,
  updated_at
FROM api_credentials
WHERE user_id = '<USER_ID>'::uuid
  AND service_name LIKE 'n8n_%'
ORDER BY service_name;

