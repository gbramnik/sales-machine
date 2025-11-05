# Rollback Procedure: UniPil → PhantomBuster

**Created:** 2025-01-11  
**Purpose:** Step-by-step procedure to revert from UniPil API back to PhantomBuster API  
**Status:** Ready for use

---

## Overview

This document provides detailed steps to rollback the migration from UniPil API back to PhantomBuster API. Use this procedure if you encounter critical issues with UniPil integration or need to revert for any reason.

**Estimated Rollback Time:** 15-30 minutes  
**Downtime:** Minimal (workflow will be inactive during rollback)

---

## Prerequisites

Before starting the rollback:

- ✅ Git repository with migration commits
- ✅ N8N workflow backup (exported JSON before migration)
- ✅ Access to environment variables (Railway/local)
- ✅ PhantomBuster API key and Agent ID
- ✅ Access to Supabase database (if credentials were stored)

---

## Rollback Steps

### Step 1: Revert Git Changes

#### 1.1 Identify Migration Commits

```bash
# View recent commits related to migration
git log --oneline --grep="unipil\|UniPil\|migration" -i

# Or view all commits since migration
git log --oneline --since="2025-01-11"
```

#### 1.2 Revert Strategy

**Option A: Revert Specific Commits (Recommended)**

```bash
# If migration was in a single commit
git revert <COMMIT_HASH>

# If migration was in multiple commits, revert each:
git revert <COMMIT_HASH_1>
git revert <COMMIT_HASH_2>
# ... etc
```

**Option B: Reset to Pre-Migration State**

⚠️ **Warning:** Only use if you haven't pushed changes or have a backup branch.

```bash
# Create backup branch first
git branch backup-before-rollback

# Identify commit before migration
git log --oneline

# Reset to commit before migration (replace COMMIT_HASH)
git reset --hard <COMMIT_HASH>
```

#### 1.3 Files to Revert

The following files should be reverted:

- ✅ `workflows/linkedin-scraper.json`
- ✅ `apps/api/src/routes/settings.ts`
- ✅ `apps/api/src/services/UniPilService.ts` (delete if created)
- ✅ `apps/api/ENV_VARIABLES.md`
- ✅ `docs/migration/PHANTOMBUSTER_REFERENCES.md` (keep for reference)
- ✅ `docs/migration/PHANTOMBUSTER_TO_UNIPIL.md` (keep for reference)
- ✅ `docs/migration/ROLLBACK_PHANTOMBUSTER.md` (this file - keep)

**Note:** Keep migration documentation files for future reference.

---

### Step 2: Revert N8N Workflow

#### 2.1 Option A: Import Backup (Recommended)

1. **Access N8N Cloud Dashboard:**
   - Go to https://app.n8n.cloud (or your N8N instance)
   - Navigate to Workflows

2. **Import Workflow:**
   - Click "Import from File"
   - Select the backup JSON file (`linkedin-scraper.json` from before migration)
   - Click "Import"

3. **Verify Workflow:**
   - Check that node "PhantomBuster API" exists (not "UniPil API")
   - Verify URL: `https://api.phantombuster.com/api/v2/agents/launch`
   - Verify header: `X-Phantombuster-Key`
   - Verify request body includes `agentId` and `argument` wrapper

4. **Activate Workflow:**
   - Click "Activate" toggle
   - Verify workflow is active

#### 2.2 Option B: Manual Revert

1. **Open Workflow in N8N:**
   - Go to N8N Cloud Dashboard
   - Open "LinkedIn Profile Scraper" workflow

2. **Update HTTP Request Node:**
   - Find "UniPil API" node
   - Change name to "PhantomBuster API"
   - Update URL: `https://api.phantombuster.com/api/v2/agents/launch`
   - Update headers:
     - Remove: `Authorization: Bearer {{ $env.UNIPIL_API_KEY }}`
     - Add: `X-Phantombuster-Key: {{ $env.PHANTOMBUSTER_API_KEY }}`
     - Keep: `Content-Type: application/json`
   - Update request body:
     - Add: `agentId: {{ $env.PHANTOMBUSTER_AGENT_ID }}`
     - Wrap parameters in `argument` object:
       ```json
       {
         "agentId": "{{ $env.PHANTOMBUSTER_AGENT_ID }}",
         "argument": {
           "industry": "...",
           "location": "...",
           "jobTitle": "...",
           "companySize": "..."
         }
       }
       ```

3. **Update "Validate & Map Profiles" Node:**
   - Change comment: `// Map PhantomBuster response to prospect format`
   - Update field mapping:
     ```javascript
     const profiles = $input.item.json.output || $input.item.json.profiles || [];
     const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
     const company = profile.company || profile.companyName || '';
     const jobTitle = profile.headline || profile.jobTitle || '';
     ```

4. **Update "Notify Error" Node:**
   - Change error message: `'PhantomBuster scraping failed after 3 retries'`

5. **Update Connections:**
   - Change all references from "UniPil API" to "PhantomBuster API"

6. **Save and Activate:**
   - Click "Save"
   - Activate workflow

---

### Step 3: Revert Environment Variables

#### 3.1 Local Development (.env file)

```bash
# In apps/api/.env
# Remove UniPil variables
UNIPIL_API_KEY=<remove>
UNIPIL_API_URL=<remove>

# Add PhantomBuster variables
PHANTOMBUSTER_API_KEY=your_phantombuster_api_key
PHANTOMBUSTER_AGENT_ID=your_phantombuster_agent_id
```

#### 3.2 Railway Deployment

1. **Access Railway Dashboard:**
   - Go to https://railway.app
   - Navigate to your project
   - Click on "Variables" tab

2. **Remove UniPil Variables:**
   - Delete `UNIPIL_API_KEY`
   - Delete `UNIPIL_API_URL` (if exists)

3. **Add PhantomBuster Variables:**
   - Add `PHANTOMBUSTER_API_KEY` = your API key
   - Add `PHANTOMBUSTER_AGENT_ID` = your agent ID

4. **N8N Environment Variables:**
   - Access N8N Cloud Dashboard
   - Go to Settings → Environment Variables
   - Remove: `UNIPIL_API_KEY`, `UNIPIL_API_URL`
   - Add: `PHANTOMBUSTER_API_KEY`, `PHANTOMBUSTER_AGENT_ID`

---

### Step 4: Revert Database Changes

#### 4.1 API Credentials

If users stored UniPil credentials in the database:

```sql
-- Check for UniPil credentials
SELECT * FROM api_credentials 
WHERE service_name = 'unipil';

-- Users will need to re-enter PhantomBuster credentials via Settings UI
-- No automatic migration needed (old 'phantombuster' entries remain)
```

**Action Required:**
- Users must manually re-enter PhantomBuster credentials via Settings UI
- Old `service_name = 'phantombuster'` entries remain in database (no action needed)

#### 4.2 No Data Migration Needed

- Prospect data is unaffected (stored in `prospects` table)
- No data migration required
- Workflow will continue using existing prospect data

---

### Step 5: Verify Rollback

#### 5.1 Test N8N Workflow

1. **Trigger Test Webhook:**
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/linkedin-scraper \
     -H "Content-Type: application/json" \
     -d '{
       "industry": "Technology",
       "location": "Paris",
       "user_id": "test-user-id",
       "campaign_id": "test-campaign-id"
     }'
   ```

2. **Verify Execution:**
   - Check N8N execution logs
   - Verify "PhantomBuster API" node executes successfully
   - Verify prospects stored in Supabase

3. **Check Response:**
   - Verify response contains `validated_count` and `rejected_count`
   - Verify no errors in execution

#### 5.2 Test Settings API

1. **Test API Credential Storage:**
   ```bash
   curl -X POST https://your-api.com/settings/api-credentials \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "service_name": "phantombuster",
       "api_key": "test-api-key"
     }'
   ```

2. **Verify:**
   - Credential stored successfully
   - No validation errors
   - Service name accepted

#### 5.3 Check Logs

- **N8N Execution Logs:** Verify no UniPil references
- **API Gateway Logs:** Verify no UniPil service calls
- **Supabase Logs:** Verify prospect inserts working

---

## Post-Rollback Checklist

- [ ] Git changes reverted
- [ ] N8N workflow restored and active
- [ ] Environment variables updated (local and Railway)
- [ ] N8N environment variables updated
- [ ] Workflow test executed successfully
- [ ] Settings API test passed
- [ ] Logs verified (no errors)
- [ ] Documentation updated (if needed)

---

## Troubleshooting

### Issue: Workflow Still References UniPil

**Solution:**
- Verify workflow JSON was properly imported
- Check all node connections reference "PhantomBuster API"
- Verify environment variables are set correctly

### Issue: Authentication Errors

**Solution:**
- Verify `PHANTOMBUSTER_API_KEY` is set in N8N environment variables
- Check header format: `X-Phantombuster-Key: {API_KEY}`
- Verify API key is valid in PhantomBuster dashboard

### Issue: Agent ID Not Found

**Solution:**
- Verify `PHANTOMBUSTER_AGENT_ID` is set in N8N environment variables
- Check agent exists in PhantomBuster dashboard
- Verify agent is active

### Issue: Response Format Errors

**Solution:**
- Verify "Validate & Map Profiles" node uses PhantomBuster field mapping
- Check response structure: `{ output: [...] }`
- Verify field names: `firstName`, `lastName`, `headline`, `company`, `profileUrl`

---

## Rollback Testing

**Test on Dev Environment First:**

1. Apply migration changes
2. Test UniPil integration
3. Execute rollback procedure
4. Verify PhantomBuster integration works
5. Document any issues
6. Proceed with production rollback if successful

---

## Prevention

To avoid rollback issues:

1. **Keep Git History:** Never force-push migration commits
2. **Backup Workflows:** Export N8N workflows before migration
3. **Test Thoroughly:** Test migration on dev environment first
4. **Monitor Closely:** Watch logs for first 24 hours post-migration
5. **Document Issues:** Keep track of any problems encountered

---

## References

- **Migration Document:** `docs/migration/PHANTOMBUSTER_TO_UNIPIL.md`
- **Inventory:** `docs/migration/PHANTOMBUSTER_REFERENCES.md`
- **PhantomBuster API Docs:** https://www.phantombuster.com/api
- **UniPil API Docs:** https://unipil.io/docs (for reference)

---

**Generated by:** Dev Agent (James)  
**Date:** 2025-01-11  
**Story:** 1.2.1 - Migration PhantomBuster → UniPil

