# PhantomBuster References Inventory

**Created:** 2025-01-11  
**Purpose:** Complete inventory of all PhantomBuster references in the codebase to be migrated to UniPil API

## Summary

| Category | Count | Status |
|----------|-------|--------|
| **Workflows** | 1 | ❌ Needs Update |
| **API Routes** | 1 | ❌ Needs Update |
| **Services** | 0 | ✅ None found |
| **Environment Variables** | 2 | ❌ Needs Update |
| **Documentation** | 20+ | ❌ Needs Update |
| **Stories** | 4 | ⚠️ Partially Updated |

## 1. Workflows

### 1.1 `workflows/linkedin-scraper.json`
**File:** `workflows/linkedin-scraper.json`  
**Lines:** 28-68, 63, 155, 195, 235  
**Status:** ❌ **CRITICAL - Needs Migration**

**References Found:**
- Line 30: URL: `https://api.phantombuster.com/api/v2/agents/launch`
- Line 37: Header: `X-Phantombuster-Key: {{ $env.PHANTOMBUSTER_API_KEY }}`
- Line 50: Parameter: `agentId: {{ $env.PHANTOMBUSTER_AGENT_ID }}`
- Line 63: Node name: `"PhantomBuster API"`
- Line 67: Node ID: `"phantombuster-api"`
- Line 114: Comment: `// Map PhantomBuster response to prospect format`
- Line 155: Error message: `'PhantomBuster scraping failed after 3 retries'`
- Line 195: Connection reference: `"PhantomBuster API"`
- Line 235: Retry connection: `"PhantomBuster API"`

**Action Required:**
- Replace HTTP Request node with UniPil API endpoint
- Update authentication headers (Bearer token instead of X-Phantombuster-Key)
- Remove `agentId` parameter (UniPil doesn't use agents)
- Update request body format (direct parameters instead of `argument` wrapper)
- Update response mapping to handle UniPil response format
- Update error messages to reference UniPil

## 2. API Routes

### 2.1 `apps/api/src/routes/settings.ts`
**File:** `apps/api/src/routes/settings.ts`  
**Line:** 10  
**Status:** ❌ **CRITICAL - Needs Update**

**Reference Found:**
```typescript
service_name: z.enum([
  'openai',
  'phantombuster',  // ← Line 10: Needs replacement with 'unipil'
  'instantly',
  // ...
])
```

**Action Required:**
- Replace `'phantombuster'` with `'unipil'` in the Zod enum schema
- Update validation logic if needed (UniPil API key format)
- Update any comments referencing PhantomBuster

## 3. Environment Variables

### 3.1 `apps/api/ENV_VARIABLES.md`
**File:** `apps/api/ENV_VARIABLES.md`  
**Line:** 50  
**Status:** ❌ **Needs Update**

**Reference Found:**
```markdown
- PhantomBuster API Key
```

**Action Required:**
- Replace "PhantomBuster API Key" with "UniPil API Key"
- Update documentation to reflect UniPil API key storage

### 3.2 `docs/dev-setup.md`
**File:** `docs/dev-setup.md`  
**Line:** 317  
**Status:** ✅ **Already Updated**

**Reference Found:**
- Line 317: `UNIPIL_API_KEY` already present (no PhantomBuster reference)

**Note:** This file already references UniPil, no action needed.

### 3.3 Missing `.env.example` file
**Status:** ⚠️ **File Not Found**

**Action Required:**
- Create `.env.example` file if it doesn't exist
- Add `UNIPIL_API_KEY` to environment variable examples
- Remove `PHANTOMBUSTER_API_KEY` and `PHANTOMBUSTER_AGENT_ID` if they exist

## 4. Documentation Files

### 4.1 QA/Validation Reports
**Status:** ⚠️ **Reference Only - No Action Needed**

These files reference PhantomBuster in context of migration stories:
- `docs/qa/PO_MASTER_CHECKLIST_VALIDATION_REPORT_V2.md` (multiple references - migration context)
- `docs/qa/VERIFICATION_RECOMMANDATIONS_CHECKLIST.md` (migration context)
- `docs/qa/PO_MASTER_CHECKLIST_VALIDATION_REPORT.md` (migration context)

**Action:** No action needed - these are documentation about the migration itself.

### 4.2 Story Files
**Status:** ⚠️ **Partially Updated - Verification Needed**

#### 4.2.1 `docs/stories/1.2.1.migration-phantombuster-to-unipil.md`
**Status:** ✅ **OK - This is the migration story itself**

#### 4.2.2 `docs/stories/1.2.linkedin-profile-scraping-workflow.md`
**Status:** ✅ **Already Updated**
- Line 15: References UniPil API (already updated)
- Line 221: Historical reference to PhantomBuster in change log (acceptable)

#### 4.2.3 `docs/stories/1.9.linkedin-warmup-workflow.md`
**Status:** ✅ **Already Updated**
- References UniPil API (already updated)

#### 4.2.4 `docs/stories/1.10.daily-prospect-detection-filtering.md`
**Status:** ✅ **Already Updated**
- References UniPil API (already updated)

### 4.3 Architecture Documentation
**Status:** ✅ **Already Updated**

- `docs/architecture/api-specification.md` - References UniPil (line 19)
- `docs/architecture/high-level-architecture.md` - References UniPil (line 163)
- `docs/architecture/components.md` - References UniPil (line 14, 17, 20)

### 4.4 PRD Documentation
**Status:** ✅ **Already Updated**

- `docs/prd/requirements.md` - References UniPil (lines 5, 7, 9, 13, 19)
- `docs/prd/next-steps.md` - Historical reference (line 68, acceptable)

### 4.5 Other Documentation Files
**Status:** ⚠️ **Reference Only - No Action Needed**

These files reference PhantomBuster in migration context or historical context:
- `SM_AGENT_WORKFLOW_CYCLE.md` - Migration context
- `SM_AGENT_ANALYSIS.md` - Migration context
- `MIGRATIONS_DEPLOYMENT_COMPLETE.md` - Migration context
- `MIGRATIONS_DATABASE_CREATED.md` - Migration context
- `RESUME_ACTIONS_ISSUES_CRITIQUES.md` - Migration context
- `PLAN_ACTION_ISSUES_CRITIQUES.md` - Migration context
- `VALIDATION_PLAN_ACTION_ARCHITECT.md` - Migration context
- `PHASE1_PRD_ARCHITECTURE_REVISION_COMPLETE.md` - Historical reference

**Action:** No action needed - these are documentation about the migration planning.

## 5. Code References (Services)

### 5.1 Services Directory
**Status:** ✅ **No PhantomBuster Service Found**

**Search Results:**
- No `PhantomBusterService.ts` file found
- No service files reference PhantomBuster API calls

**Action:** None required - no service layer implementation exists.

## 6. Critical Files Requiring Migration

### Priority 1: Core Implementation Files
1. ✅ **`workflows/linkedin-scraper.json`** - Replace PhantomBuster API node with UniPil
2. ✅ **`apps/api/src/routes/settings.ts`** - Replace 'phantombuster' with 'unipil' in enum

### Priority 2: Environment & Configuration
3. ✅ **`apps/api/ENV_VARIABLES.md`** - Update API key documentation
4. ⚠️ **`.env.example`** - Create/update if missing

### Priority 3: Documentation
5. ✅ **Story files** - Already updated (verify consistency)
6. ✅ **Architecture docs** - Already updated

## 7. Migration Checklist

- [x] **Task 1.1:** Search codebase for "PhantomBuster", "phantombuster", "PHANTOMBUSTER"
- [x] **Task 1.2:** Search workflows for PhantomBuster references
- [x] **Task 1.3:** Search routes/services for PhantomBuster references
- [x] **Task 1.4:** Search documentation for PhantomBuster references
- [x] **Task 1.5:** Create inventory list (this file)

## 8. Next Steps

1. **Task 2:** Create migration document with API mapping
2. **Task 3:** Create UniPilService
3. **Task 4:** Update N8N workflow
4. **Task 5:** Update Settings API route
5. **Task 6:** Update environment variables documentation

---

**Generated by:** Dev Agent (James)  
**Date:** 2025-01-11  
**Story:** 1.2.1 - Migration PhantomBuster → UniPil

