# Database Schema

*[Complete schema provided in separate section above]*

**Tables:** users, campaigns, prospects, prospect_enrichment, email_templates, ai_conversation_log, meetings, ai_review_queue, audit_log, linkedin_warmup_actions, linkedin_warmup_schedule, linkedin_connections

**New Tables for No Spray No Pray:**
- `linkedin_warmup_actions` - Tracks daily warm-up actions (likes, comments, author engagements)
- `linkedin_warmup_schedule` - Manages warm-up schedule per prospect (7-15 days)
- `linkedin_connections` - Tracks LinkedIn connection requests and status

**Extended Tables:**
- `prospect_enrichment` - Added: company_data (JSONB), website_data (JSONB), email_found (TEXT), phone_found (TEXT)
- `conversations` - Added: channel (TEXT: 'linkedin' | 'email' | 'both'), linkedin_message_id (TEXT), email_message_id (TEXT)

**Key Indexes:**
- `idx_prospects_user_campaign` - Filtered queries
- `idx_prospects_status` - Pipeline stage queries
- `idx_ai_review_queue_pending` - Review queue lookups
- `idx_enrichment_tech_stack` - GIN index for JSONB queries
- `idx_warmup_schedule_status` - Filter prospects ready for connection
- `idx_warmup_actions_prospect_date` - Track daily warm-up actions
- `idx_linkedin_connections_status` - Filter connection requests by status

**Row-Level Security:** All tables enforce `auth.uid() = user_id` for multi-tenancy

---
