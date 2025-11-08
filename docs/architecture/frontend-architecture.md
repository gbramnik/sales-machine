# Frontend Architecture

## Component Organization (Atomic Design)

```
components/
├── atoms/       # shadcn/ui primitives (Button, Input, Badge)
├── molecules/   # ConfidenceBadge, VIPAccountIndicator
├── organisms/   # HealthScoreCard, PipelineKanban, AIActivityStream
└── templates/   # DashboardLayout, OnboardingLayout
```

## State Management (Zustand)

```typescript
// stores/auth.store.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  login: (user, session) => set({ user, session }),
  logout: () => set({ user: null, session: null }),
}));
```

## Routing (React Router)

```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/review-queue" element={<ReviewQueuePage />} />
    {/* ... */}
  </Route>
  <Route path="/onboarding/*" element={<OnboardingLayout />} />
</Routes>
```

### Onboarding Guard Flow
- `ProtectedRoute` first validates Supabase session (Story 1.1) and then consults onboarding status via `useOnboardingStatus` (Story 5.5).
- When `completed=false`, guard redirects to `/onboarding` while persisting the originally requested path for post-completion navigation.
- The onboarding layout re-checks status before allowing transition to `/dashboard` to avoid stale Zustand cache scenarios.
- On successful `POST /onboarding/complete`, the onboarding store broadcasts completion events so other components (e.g., `DashboardLayout`, `OnboardingChecklist`) update immediately.

### Dashboard Layout Shell
- All authenticated routes render inside `DashboardLayout` (templates). Sidebar lists Dashboard, Prospects, Review Queue, Templates, Analytics, Settings, with active route highlighting.
- Sidebar collapses at tablet breakpoint but remains keyboard accessible; toggle control stays visible in header and must preserve focus order.
- Provide `skip-to-content` anchor before main area to satisfy accessibility targets.

## API Client (Axios)

```typescript
// lib/api-client.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---
