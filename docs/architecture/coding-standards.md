# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in `packages/shared` and import from there (never duplicate types)
- **API Calls:** Never make direct HTTP calls - use the service layer (`CampaignService`, `ProspectService`)
- **Environment Variables:** Access only through config objects, never `process.env` directly
- **Error Handling:** All API routes must use the standard error handler middleware
- **State Updates:** Never mutate state directly - use Zustand actions or React setState
- **Database Queries:** Always use Supabase RLS policies - never raw SQL without `user_id` filter
- **N8N Webhooks:** Validate all payloads with Zod schemas before processing
- **Redis Cache:** Always set TTL when caching (never infinite cache)

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/user-profile` |
| Database Tables | - | snake_case | `user_profiles` |
| Services | PascalCase | PascalCase | `ProspectService` |
| Utilities | camelCase | camelCase | `formatDate` |

---
