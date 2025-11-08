# Rollback Procedure Testing Guide

## Overview

This document provides step-by-step instructions for testing the rollback procedure from UniPil back to PhantomBuster. This is a critical validation step for the migration (Story 1.2.1, Task 8).

## Prerequisites

- Development environment with Git access
- N8N Cloud workspace access
- Supabase database access
- PhantomBuster API key (if available for testing)
- UniPil API key (current setup)

## Test Environment Setup

1. **Create test branch:**
   ```bash
   git checkout -b test/rollback-validation
   ```

2. **Document current state:**
   ```bash
   # Note current Git commit
   git log --oneline -1 > rollback-test-baseline.txt
   
   # Export current N8N workflow
   # (Download from N8N Cloud UI or use API)
   ```

3. **Backup current environment variables:**
   ```bash
   # Save current .env state
   cp .env .env.unipil-backup
   ```

## Rollback Test Procedure

### Step 1: Revert Code Changes

**Option A: Git Revert (Recommended)**
```bash
# Find commits related to UniPil migration
git log --oneline --grep="UniPil\|PhantomBuster" --all

# Revert specific commits (example)
git revert <commit-hash-1> <commit-hash-2>

# Or revert to specific commit before migration
git revert --no-commit HEAD~5..HEAD
```

**Option B: Manual File Restoration**
```bash
# Restore files from Git history
git checkout <pre-migration-commit> -- workflows/linkedin-scraper.json
git checkout <pre-migration-commit> -- apps/api/src/services/UniPilService.ts
git checkout <pre-migration-commit> -- apps/api/src/routes/settings.ts
```

### Step 2: Restore N8N Workflow

**Option A: Import Backup**
1. Open N8N Cloud workspace
2. Go to Workflows → Import
3. Upload `workflows/linkedin-scraper.json` backup (pre-UniPil version)
4. Activate workflow

**Option B: Manual Revert in N8N**
1. Open `linkedin-scraper.json` workflow
2. Replace UniPil HTTP Request node with PhantomBuster node:
   - URL: `https://api.phantombuster.com/api/v2/agents/launch`
   - Header: `X-Phantombuster-Key: {{ $env.PHANTOMBUSTER_API_KEY }}`
   - Body: 
     ```json
     {
       "agentId": "{{ $env.PHANTOMBUSTER_AGENT_ID }}",
       "argument": {
         "industry": "{{ $json.industry }}",
         "location": "{{ $json.location }}",
         "jobTitle": "{{ $json.job_title }}",
         "companySize": "{{ $json.company_size }}"
       }
     }
     ```
3. Update response mapping node to handle PhantomBuster format
4. Update error messages to reference PhantomBuster
5. Save and activate workflow

### Step 3: Restore Environment Variables

```bash
# Restore PhantomBuster variables
export PHANTOMBUSTER_API_KEY="your-phantombuster-key"
export PHANTOMBUSTER_AGENT_ID="your-agent-id"

# Remove UniPil variable (or comment out)
# export UNIPIL_API_KEY="..."

# Update .env file
cat > .env << EOF
PHANTOMBUSTER_API_KEY=your-phantombuster-key
PHANTOMBUSTER_AGENT_ID=your-agent-id
# UNIPIL_API_KEY=... (commented out)
EOF
```

### Step 4: Update Settings API

1. Verify `apps/api/src/routes/settings.ts` allows 'phantombuster' service name
2. If needed, restore validation:
   ```typescript
   const serviceNameSchema = z.enum(['unipil', 'phantombuster', 'email_finder', 'claude']);
   ```

### Step 5: Test Rollback

1. **Trigger test webhook:**
   ```bash
   curl -X POST https://n8n.srv997159.hstgr.cloud/webhook/linkedin-scraper/test \
     -H "Content-Type: application/json" \
     -d '{
       "industry": "Technology",
       "location": "Paris",
       "user_id": "test-user-id",
       "campaign_id": "test-campaign-id"
     }'
   ```

2. **Verify workflow execution:**
   - Check N8N execution log
   - Verify PhantomBuster API is called (not UniPil)
   - Verify workflow completes successfully

3. **Verify data in Supabase:**
   ```sql
   SELECT id, full_name, company_name, job_title, linkedin_url, created_at
   FROM prospects
   WHERE user_id = 'test-user-id'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

4. **Validate data format:**
   - Check field names match PhantomBuster format
   - Verify all required fields present
   - Check data types are correct

### Step 6: Test Error Scenarios

1. **Invalid API key:**
   ```bash
   export PHANTOMBUSTER_API_KEY="invalid-key"
   # Trigger webhook and verify error handling
   ```

2. **Network failure:**
   - Simulate network issue (disable internet temporarily)
   - Verify retry logic works
   - Verify error notification sent

### Step 7: Cleanup

```bash
# Restore UniPil setup
git checkout main
cp .env.unipil-backup .env

# Restore N8N workflow to UniPil version
# (Re-import or manually update)

# Delete test branch
git branch -D test/rollback-validation
```

## Validation Checklist

- [ ] Code reverted successfully (Git revert or manual)
- [ ] N8N workflow restored to PhantomBuster version
- [ ] Environment variables updated
- [ ] Settings API accepts 'phantombuster' service name
- [ ] Workflow executes successfully with PhantomBuster
- [ ] Data stored in Supabase with correct format
- [ ] Error handling works correctly
- [ ] Rollback can be completed in < 30 minutes
- [ ] Documentation updated if needed

## Expected Results

**Success Criteria:**
- Workflow completes end-to-end with PhantomBuster API
- Prospects stored in Supabase with correct format
- No data loss during rollback
- Error messages reference PhantomBuster (not UniPil)
- System fully functional with PhantomBuster

**Failure Indicators:**
- Workflow fails to execute
- Data format mismatches
- Missing environment variables
- API authentication errors
- Data corruption or loss

## Troubleshooting

### Issue: Git revert conflicts
**Solution:** Resolve conflicts manually, prioritizing PhantomBuster code

### Issue: N8N workflow import fails
**Solution:** Manually recreate workflow nodes from backup JSON

### Issue: Environment variables not loading
**Solution:** Restart API server after updating .env file

### Issue: Data format mismatch
**Solution:** Check response mapping node in N8N workflow

## Test Results Template

```markdown
## Rollback Test Results

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Development

### Test Steps Completed
- [ ] Step 1: Code reverted
- [ ] Step 2: N8N workflow restored
- [ ] Step 3: Environment variables updated
- [ ] Step 4: Settings API updated
- [ ] Step 5: Test execution successful
- [ ] Step 6: Error scenarios tested

### Issues Found
- [List any issues encountered]

### Validation Results
- Workflow execution: [PASS/FAIL]
- Data format: [PASS/FAIL]
- Error handling: [PASS/FAIL]
- Rollback time: [X minutes]

### Conclusion
[PASS/FAIL] - Rollback procedure is [working/needs improvement]
```

## Notes

- This test should be performed in development environment only
- Keep UniPil setup as primary; rollback is for emergency use only
- Document any deviations from expected procedure
- Update rollback documentation if procedure changes



