# Database Schema

*[Complete schema provided in separate section above]*

**Tables:** users, campaigns, prospects, prospect_enrichment, email_templates, ai_conversation_log, meetings, ai_review_queue, audit_log

**Key Indexes:**
- `idx_prospects_user_campaign` - Filtered queries
- `idx_prospects_status` - Pipeline stage queries
- `idx_ai_review_queue_pending` - Review queue lookups
- `idx_enrichment_tech_stack` - GIN index for JSONB queries

**Row-Level Security:** All tables enforce `auth.uid() = user_id` for multi-tenancy

---
