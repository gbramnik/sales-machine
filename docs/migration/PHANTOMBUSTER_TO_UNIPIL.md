# Migration Guide: PhantomBuster → UniPil

> **Note:** For complete UniPil API endpoint reference, see [UNIPIL_API_REFERENCE.md](./UNIPIL_API_REFERENCE.md) API

**Created:** 2025-01-11  
**Purpose:** Complete migration guide from PhantomBuster to UniPil API for LinkedIn automation  
**Status:** Draft (requires UniPil API documentation confirmation)

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoint Mapping](#api-endpoint-mapping)
3. [Request Format Differences](#request-format-differences)
4. [Response Format Differences](#response-format-differences)
5. [Data Field Mapping](#data-field-mapping)
6. [Breaking Changes](#breaking-changes)
7. [Authentication Changes](#authentication-changes)
8. [Rate Limiting](#rate-limiting)
9. [Error Handling](#error-handling)
10. [Rollback Procedure](#rollback-procedure)

---

## Overview

This migration replaces PhantomBuster API with UniPil API for all LinkedIn automation operations. The migration affects:

- **N8N Workflow:** `workflows/linkedin-scraper.json`
- **API Gateway:** Settings route for service credentials
- **Environment Variables:** API key configuration
- **Documentation:** All references to PhantomBuster

**Migration Date:** TBD  
**Estimated Downtime:** None (direct replacement, no feature flag)

---

## API Endpoint Mapping

### Current: PhantomBuster API

| Operation | Endpoint | Method |
|-----------|----------|--------|
| LinkedIn Profile Search | `https://api.phantombuster.com/api/v2/agents/launch` | POST |
| Company Page Extraction | N/A (not implemented) | - |
| LinkedIn Like | N/A (not implemented) | - |
| LinkedIn Comment | N/A (not implemented) | - |
| Connection Request | N/A (not implemented) | - |
| LinkedIn Message | N/A (not implemented) | - |

**Note:** Current implementation only uses LinkedIn Profile Search via PhantomBuster agent.

### Target: UniPil API

| Operation | Endpoint | Method | Status |
|-----------|----------|--------|--------|
| LinkedIn Profile Search | `{UNIPIL_API_URL}/api/v1/linkedin/search` | POST | ⚠️ To be confirmed |
| Company Page Extraction | `{UNIPIL_API_URL}/api/v1/linkedin/company/{companyUrl}` | GET | ⚠️ To be confirmed |
| LinkedIn Like | `{UNIPIL_API_URL}/api/v1/linkedin/like` | POST | ⚠️ To be confirmed |
| LinkedIn Comment | `{UNIPIL_API_URL}/api/v1/linkedin/comment` | POST | ⚠️ To be confirmed |
| Connection Request | `{UNIPIL_API_URL}/api/v1/linkedin/connection-request` | POST | ⚠️ To be confirmed |
| LinkedIn Message | `{UNIPIL_API_URL}/api/v1/linkedin/message` | POST | ⚠️ To be confirmed |

**Base URL:** `https://api.unipil.io` (to be confirmed with UniPil documentation)

**⚠️ Action Required:** Confirm exact endpoint paths with UniPil API documentation before implementation.

---

## Request Format Differences

### PhantomBuster Request (Current)

**Endpoint:** `POST https://api.phantombuster.com/api/v2/agents/launch`

**Headers:**
```http
X-Phantombuster-Key: {PHANTOMBUSTER_API_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "agentId": "{PHANTOMBUSTER_AGENT_ID}",
  "argument": {
    "industry": "Technology",
    "location": "Paris",
    "jobTitle": "CEO",
    "companySize": "50-200"
  }
}
```

**Key Characteristics:**
- Agent-based architecture (requires `agentId`)
- Parameters wrapped in `argument` object
- Uses custom header `X-Phantombuster-Key` for authentication

### UniPil Request (Target)

**Endpoint:** `POST {UNIPIL_API_URL}/api/v1/linkedin/search` (to be confirmed)

**Headers:**
```http
Authorization: Bearer {UNIPIL_API_KEY}
Content-Type: application/json
```

**Request Body (Expected):**
```json
{
  "industry": "Technology",
  "location": "Paris",
  "job_title": "CEO",
  "company_size": "50-200"
}
```

**Key Characteristics:**
- Direct API calls (no agent concept)
- Parameters sent directly (no `argument` wrapper)
- Uses standard `Authorization: Bearer` header

**⚠️ Action Required:** Confirm exact request body format with UniPil API documentation.

---

## Response Format Differences

### PhantomBuster Response (Current)

**Response Structure:**
```json
{
  "output": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "headline": "CEO at TechCorp",
      "company": "TechCorp",
      "profileUrl": "https://linkedin.com/in/johndoe",
      "location": "Paris, France",
      "summary": "Experienced CEO with 10+ years..."
    }
  ]
}
```

**Field Mapping (Current Workflow):**
- `firstName` + `lastName` → `full_name`
- `headline` → `job_title`
- `company` → `company_name`
- `profileUrl` → `linkedin_url`
- `location` → `location`
- `summary` → `profile_summary`

### UniPil Response (Expected)

**Response Structure (To be confirmed):**
```json
{
  "profiles": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "job_title": "CEO at TechCorp",
      "company_name": "TechCorp",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "location": "Paris, France",
      "profile_summary": "Experienced CEO with 10+ years...",
      "profile_picture_url": "https://..."
    }
  ]
}
```

**⚠️ Action Required:** Confirm exact response structure with UniPil API documentation.

---

## Data Field Mapping

### Profile Data Mapping

| PhantomBuster Field | UniPil Field (Expected) | Mapping Logic |
|---------------------|------------------------|---------------|
| `firstName` | `first_name` | Direct mapping |
| `lastName` | `last_name` | Direct mapping |
| `firstName + lastName` | `full_name` | Concatenate or use `full_name` if provided |
| `headline` | `job_title` | Direct mapping |
| `company` | `company_name` | Direct mapping |
| `profileUrl` | `linkedin_url` | Direct mapping |
| `location` | `location` | Direct mapping |
| `summary` | `profile_summary` | Direct mapping |
| `email` | `email` | Direct mapping (if provided) |
| `phone` | `phone` | Direct mapping (if provided) |
| N/A | `profile_picture_url` | New field (if provided by UniPil) |

### Company Page Data Mapping

**PhantomBuster:** Not implemented  
**UniPil:** New feature to be implemented

| UniPil Field (Expected) | Target Field | Notes |
|-------------------------|--------------|-------|
| `company_description` | `company_description` | Company LinkedIn page description |
| `industry` | `industry` | Company industry |
| `company_size` | `company_size` | Number of employees |
| `headquarters` | `headquarters` | Company headquarters location |
| `website` | `website` | Company website URL |
| `linkedin_url` | `company_linkedin_url` | Company LinkedIn page URL |

---

## Breaking Changes

### 1. Agent-Based → Direct API

**Before (PhantomBuster):**
- Required `agentId` parameter
- Agent must be configured in PhantomBuster dashboard
- Environment variable: `PHANTOMBUSTER_AGENT_ID`

**After (UniPil):**
- No agent concept
- Direct API calls
- Environment variable: `UNIPIL_API_KEY` (no agent ID needed)

**Migration Impact:**
- Remove `PHANTOMBUSTER_AGENT_ID` from environment variables
- Remove `agentId` from request body
- Update documentation

### 2. Authentication Header Change

**Before (PhantomBuster):**
```http
X-Phantombuster-Key: {API_KEY}
```

**After (UniPil):**
```http
Authorization: Bearer {API_KEY}
```

**Migration Impact:**
- Update N8N workflow HTTP Request node headers
- Update any service layer code (if exists)

### 3. Request Body Structure

**Before (PhantomBuster):**
```json
{
  "agentId": "...",
  "argument": {
    "industry": "...",
    "location": "..."
  }
}
```

**After (UniPil):**
```json
{
  "industry": "...",
  "location": "..."
}
```

**Migration Impact:**
- Remove `agentId` parameter
- Remove `argument` wrapper
- Send parameters directly in request body

### 4. Response Structure

**Before (PhantomBuster):**
```json
{
  "output": [...]
}
```

**After (UniPil):**
```json
{
  "profiles": [...] // or "data": [...] - to be confirmed
}
```

**Migration Impact:**
- Update N8N workflow "Validate & Map Profiles" node
- Update field name from `output` to UniPil response field name
- Update field mapping logic (see Data Field Mapping section)

### 5. Rate Limiting

**Before (PhantomBuster):**
- Rate limits not explicitly documented in current implementation
- Likely per-agent limits

**After (UniPil):**
- **20 prospects/day** (default)
- **40 prospects/day** (configurable maximum)
- Cost: **5€/compte LinkedIn/month**

**Migration Impact:**
- Implement rate limiting check before API calls
- Track daily usage in Upstash Redis
- Return 429 error if limit exceeded

### 6. Error Response Format

**Before (PhantomBuster):**
- Error format not documented in current implementation
- Likely standard HTTP error responses

**After (UniPil):**
- Error format to be confirmed with UniPil API documentation

**Migration Impact:**
- Update error handling in N8N workflow
- Update error messages to reference UniPil instead of PhantomBuster

---

## Authentication Changes

### Environment Variables

**Remove:**
```bash
PHANTOMBUSTER_API_KEY=xxx
PHANTOMBUSTER_AGENT_ID=xxx
```

**Add:**
```bash
UNIPIL_API_KEY=xxx
UNIPIL_API_URL=https://api.unipil.io  # To be confirmed
```

**Migration Steps:**
1. Generate UniPil API key from UniPil dashboard
2. Add `UNIPIL_API_KEY` to environment variables (`.env`, Railway, etc.)
3. Remove `PHANTOMBUSTER_API_KEY` and `PHANTOMBUSTER_AGENT_ID`
4. Update `apps/api/ENV_VARIABLES.md` documentation
5. Update `docs/dev-setup.md` environment variables table

### API Gateway Settings

**Before:**
- Service name in enum: `'phantombuster'`
- Stored in `api_credentials` table with `service_name = 'phantombuster'`

**After:**
- Service name in enum: `'unipil'`
- Stored in `api_credentials` table with `service_name = 'unipil'`

**Migration Steps:**
1. Update `apps/api/src/routes/settings.ts`: Replace `'phantombuster'` with `'unipil'` in Zod enum
2. Update validation logic if needed (API key format validation)
3. Users will need to re-enter API credentials via Settings UI (old `'phantombuster'` entries remain but won't be used)

---

## Rate Limiting

### UniPil Rate Limits

- **Default:** 20 prospects/day
- **Maximum:** 40 prospects/day (configurable)
- **Cost:** 5€/compte LinkedIn/month
- **Reset:** Daily (at midnight UTC, or based on UniPil's reset schedule)

### Implementation

**Current Implementation:**
- Rate limiting not implemented for PhantomBuster (or not documented)

**Required Implementation:**
1. Track daily usage in Upstash Redis:
   - Key format: `unipil_rate_limit:{user_id}:{YYYY-MM-DD}`
   - Increment before API call
   - Check limit before increment
2. Return 429 error if limit exceeded:
   ```json
   {
     "error": {
       "code": "RATE_LIMIT_EXCEEDED",
       "message": "Daily UniPil API limit reached (20/day). Configure higher limit in settings."
     }
   }
   ```
3. Check user settings for custom limit (default: 20, max: 40)

**Migration Impact:**
- New feature: Rate limiting awareness
- Must be implemented before or during migration

---

## Error Handling

### PhantomBuster Error Handling (Current)

**Current Implementation:**
- Retry logic: 3 retries with exponential backoff (1s, 2s, 4s)
- Error notification: Webhook to `/webhooks/n8n/scraping-failed`
- Error message: `"PhantomBuster scraping failed after 3 retries"`

### UniPil Error Handling (Required)

**Required Implementation:**
1. **Retry Logic:** Keep same retry logic (3 retries, exponential backoff)
2. **Error Messages:** Update to reference UniPil:
   - `"UniPil scraping failed after 3 retries"`
   - Update N8N workflow "Notify Error" node
3. **Error Response Handling:** Map UniPil error responses to standard format
4. **Error Codes:** Document UniPil error codes (to be confirmed)

**Migration Steps:**
1. Update N8N workflow error messages
2. Update error notification webhook payload (if needed)
3. Test error scenarios:
   - Invalid API key
   - Network timeout
   - Rate limit exceeded
   - Invalid request parameters

---

## Rollback Procedure

### Prerequisites

- Git history preserved (all PhantomBuster code in Git)
- N8N workflow backup (export current workflow before migration)
- Environment variables backup (document current values)

### Rollback Steps

#### Step 1: Revert Git Changes

```bash
# Identify commit hash before migration
git log --oneline | grep -i "migration.*unipil"

# Revert to commit before migration (replace COMMIT_HASH)
git revert COMMIT_HASH

# Or if migration was in single commit:
git reset --hard COMMIT_HASH^
```

**Files to revert:**
- `workflows/linkedin-scraper.json`
- `apps/api/src/routes/settings.ts`
- `apps/api/src/services/UniPilService.ts` (delete if created)
- `docs/migration/PHANTOMBUSTER_REFERENCES.md` (keep for reference)
- `docs/migration/PHANTOMBUSTER_TO_UNIPIL.md` (keep for reference)
- `apps/api/ENV_VARIABLES.md`
- `docs/dev-setup.md`

#### Step 2: Revert N8N Workflow

1. **Option A: Import Backup**
   - Go to N8N Cloud dashboard
   - Import workflow backup (JSON file)
   - Activate workflow

2. **Option B: Manual Revert**
   - Open `workflows/linkedin-scraper.json` (reverted version)
   - Copy workflow JSON
   - Paste into N8N workflow editor
   - Save and activate

#### Step 3: Revert Environment Variables

**Remove:**
```bash
UNIPIL_API_KEY=xxx
UNIPIL_API_URL=xxx
```

**Restore:**
```bash
PHANTOMBUSTER_API_KEY=xxx
PHANTOMBUSTER_AGENT_ID=xxx
```

**Update:**
- Railway environment variables (if deployed)
- Local `.env` files
- Documentation

#### Step 4: Revert Database Changes

**If UniPilService was used and stored credentials:**
```sql
-- Check if any credentials were stored with service_name = 'unipil'
SELECT * FROM api_credentials WHERE service_name = 'unipil';

-- Users will need to re-enter PhantomBuster credentials via Settings UI
-- No automatic migration needed (old 'phantombuster' entries remain)
```

#### Step 5: Verify Rollback

1. **Test N8N Workflow:**
   - Trigger webhook with sample data
   - Verify PhantomBuster API call succeeds
   - Verify prospects stored in Supabase

2. **Test Settings API:**
   - POST `/settings/api-credentials` with `{ service_name: "phantombuster", api_key: "..." }`
   - Verify credential stored correctly

3. **Check Logs:**
   - N8N execution logs
   - API Gateway logs
   - Supabase logs

### Rollback Testing

**Test on Dev Environment:**
1. Apply migration changes
2. Test UniPil integration
3. Execute rollback procedure
4. Verify PhantomBuster integration works
5. Document any issues

**Rollback Time Estimate:** 15-30 minutes

---

## Migration Checklist

### Pre-Migration

- [ ] Review this migration document
- [ ] Confirm UniPil API documentation (endpoints, request/response formats)
- [ ] Obtain UniPil API key
- [ ] Test UniPil API with sample requests (Postman/curl)
- [ ] Backup N8N workflow (export JSON)
- [ ] Document current PhantomBuster configuration
- [ ] Create feature branch: `migration/phantombuster-to-unipil`

### Migration Steps

- [ ] **Task 1:** Identify all PhantomBuster references ✅
- [ ] **Task 2:** Create migration document ✅
- [ ] **Task 3:** Create UniPilService
- [ ] **Task 4:** Update N8N workflow
- [ ] **Task 5:** Update Settings API route
- [ ] **Task 6:** Update environment variables
- [ ] **Task 7:** Test migration (dev environment)
- [ ] **Task 8:** Document rollback procedure ✅
- [ ] **Task 9:** Update stories for consistency
- [ ] **Task 10:** Write unit tests

### Post-Migration

- [ ] Deploy to production
- [ ] Monitor for errors (first 24 hours)
- [ ] Verify data format matches expectations
- [ ] Verify rate limiting works correctly
- [ ] Update user documentation
- [ ] Remove PhantomBuster code (after 1 week validation)

---

## Questions & Action Items

### ⚠️ Requires Confirmation

1. **UniPil API Base URL:** Confirm exact base URL (`https://api.unipil.io` or other?)
2. **Endpoint Paths:** Confirm exact endpoint paths for all operations
3. **Request Format:** Confirm exact request body structure
4. **Response Format:** Confirm exact response structure and field names
5. **Error Format:** Confirm error response format and error codes
6. **Rate Limit Reset:** Confirm when daily limits reset (midnight UTC?)
7. **Authentication:** Confirm Bearer token format (any prefix needed?)

### Action Items

- [ ] Contact UniPil support or review API documentation
- [ ] Create test script to validate UniPil API endpoints
- [ ] Update this document with confirmed API details
- [ ] Create implementation issue tickets

---

## References

- **Story:** `docs/stories/1.2.1.migration-phantombuster-to-unipil.md`
- **Inventory:** `docs/migration/PHANTOMBUSTER_REFERENCES.md`
- **Current Workflow:** `workflows/linkedin-scraper.json`
- **Architecture:** `docs/architecture/backend-architecture.md#linkedin-automation-unipil-service`

---

**Generated by:** Dev Agent (James)  
**Date:** 2025-01-11  
**Status:** Draft (requires UniPil API documentation confirmation)

