#!/usr/bin/env tsx
/**
 * Script to configure N8N webhooks in api_credentials table
 * 
 * Usage:
 *   tsx scripts/setup-n8n-webhooks.ts <user_id>
 * 
 * Or set USER_ID environment variable:
 *   USER_ID=xxx tsx scripts/setup-n8n-webhooks.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// N8N Webhooks configuration
const N8N_WEBHOOKS = [
  {
    service_name: 'n8n_linkedin_scrape',
    webhook_url: 'https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper',
    workflow_id: 'bSH0ds0r0PEyxIsv',
    description: 'LinkedIn Profile Scraper',
  },
  {
    service_name: 'n8n_ai_enrichment',
    webhook_url: 'https://n8n.srv997159.hstgr.cloud/webhook/ai-enrichment',
    workflow_id: 'DG6jPgRIP4KgrAKl',
    description: 'AI-Powered Contextual Enrichment',
  },
  {
    service_name: 'n8n_email_reply',
    webhook_url: 'https://n8n.srv997159.hstgr.cloud/webhook/smtp/email-reply',
    workflow_id: 'TZBWM2CaRWzUUPiS',
    description: 'AI Conversation Agent (Email Reply)',
  },
  {
    service_name: 'n8n_ai_conversation',
    webhook_url: 'https://n8n.srv997159.hstgr.cloud/webhook/unipil/linkedin-reply',
    workflow_id: 'TZBWM2CaRWzUUPiS',
    description: 'AI Conversation Agent (LinkedIn Reply)',
  },
  {
    service_name: 'n8n_meeting_booking',
    webhook_url: 'https://n8n.srv997159.hstgr.cloud/webhook/meeting-booking',
    workflow_id: 'iwI4yZbkNXbYjrgj',
    description: 'Meeting Booking Webhook',
  },
  {
    service_name: 'n8n_domain_verification',
    webhook_url: 'https://n8n.srv997159.hstgr.cloud/webhook/domain-verification',
    workflow_id: 'JFJ6dZZcm6CpXkVZ',
    description: 'Domain Verification',
  },
];

async function setupN8NWebhooks(userId: string) {
  console.log(`\n🔧 Configuration des webhooks N8N pour l'utilisateur: ${userId}\n`);

  // Verify user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error(`❌ Utilisateur non trouvé: ${userId}`);
    console.error(`   Erreur: ${userError?.message}`);
    process.exit(1);
  }

  console.log(`✅ Utilisateur trouvé: ${user.email} (${user.full_name || 'N/A'})\n`);

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as Array<{ service: string; error: string }>,
  };

  // Configure each webhook
  for (const webhook of N8N_WEBHOOKS) {
    try {
      // Check if credential already exists
      const { data: existing } = await supabase
        .from('api_credentials')
        .select('id, webhook_url, is_active')
        .eq('user_id', userId)
        .eq('service_name', webhook.service_name)
        .single();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('api_credentials')
          .update({
            webhook_url: webhook.webhook_url,
            is_active: true,
            updated_at: new Date().toISOString(),
            metadata: {
              workflow_id: webhook.workflow_id,
              description: webhook.description,
              configured_at: new Date().toISOString(),
            },
          })
          .eq('id', existing.id);

        if (updateError) {
          throw updateError;
        }

        if (existing.webhook_url !== webhook.webhook_url) {
          console.log(`🔄 Mis à jour: ${webhook.service_name}`);
          console.log(`   ${existing.webhook_url} → ${webhook.webhook_url}`);
          results.updated++;
        } else {
          console.log(`⏭️  Déjà configuré: ${webhook.service_name}`);
          results.skipped++;
        }
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('api_credentials')
          .insert({
            user_id: userId,
            service_name: webhook.service_name,
            webhook_url: webhook.webhook_url,
            is_active: true,
            metadata: {
              workflow_id: webhook.workflow_id,
              description: webhook.description,
              configured_at: new Date().toISOString(),
            },
          });

        if (insertError) {
          throw insertError;
        }

        console.log(`✅ Créé: ${webhook.service_name}`);
        console.log(`   ${webhook.webhook_url}`);
        results.created++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erreur pour ${webhook.service_name}: ${errorMessage}`);
      results.errors.push({
        service: webhook.service_name,
        error: errorMessage,
      });
    }
  }

  // Summary
  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ Créés: ${results.created}`);
  console.log(`   🔄 Mis à jour: ${results.updated}`);
  console.log(`   ⏭️  Déjà configurés: ${results.skipped}`);
  if (results.errors.length > 0) {
    console.log(`   ❌ Erreurs: ${results.errors.length}`);
    results.errors.forEach(({ service, error }) => {
      console.log(`      - ${service}: ${error}`);
    });
  }

  console.log(`\n⚠️  Note: Assurez-vous que les workflows N8N sont activés dans N8N Cloud!\n`);
}

// Main execution
async function main() {
  const userId = process.argv[2] || process.env.USER_ID;

  if (!userId) {
    console.error('❌ Usage: tsx scripts/setup-n8n-webhooks.ts <user_id>');
    console.error('   Ou: USER_ID=xxx tsx scripts/setup-n8n-webhooks.ts');
    process.exit(1);
  }

  try {
    await setupN8NWebhooks(userId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();



