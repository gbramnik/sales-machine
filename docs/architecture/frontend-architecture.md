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
</Routes>
```

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
