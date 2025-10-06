# Testing Strategy

## Testing Pyramid

```
      E2E Tests (Playwright)
     /                    \
  Integration Tests (Vitest)
 /                            \
Frontend Unit  |  Backend Unit
(Vitest)       |  (Vitest)
```

## Accessibility Testing

**Tools:**
- **Static Analysis:** eslint-plugin-jsx-a11y (pre-commit hook)
- **Runtime Testing:** @axe-core/react (development environment only)
- **CI Integration:** @axe-core/playwright (E2E tests)
- **Manual Testing:** Screen reader testing with NVDA (Windows) and VoiceOver (Mac)

**Compliance Target:** WCAG 2.1 Level AA

**Testing Process:**
1. Pre-commit: ESLint checks for JSX accessibility violations
2. Development: Axe DevTools browser extension for manual checks
3. CI: Playwright runs axe accessibility scans on all E2E tests
4. Release: Manual screen reader testing of critical user journeys

## Test Organization

**Frontend Tests:**
```
apps/web/tests/
├── unit/
│   ├── components/HealthScoreCard.test.tsx
│   └── hooks/useAuth.test.ts
└── e2e/
    ├── onboarding.spec.ts
    └── review-queue.spec.ts
```

**Backend Tests:**
```
apps/api/tests/
├── unit/
│   ├── services/prospect.service.test.ts
│   └── middleware/auth.middleware.test.ts
└── integration/
    └── routes/prospects.test.ts
```

## Test Examples

**Frontend Component Test (Vitest):**
```typescript
import { render, screen } from '@testing-library/react';
import { HealthScoreCard } from '@/components/organisms/HealthScoreCard';

test('displays health score', () => {
  render(<HealthScoreCard score={92} breakdown={...} trend="up" trendValue={5} />);
  expect(screen.getByText('92')).toBeInTheDocument();
  expect(screen.getByText('+5')).toBeInTheDocument();
});
```

**Backend API Test (Vitest):**
```typescript
import { buildApp } from '@/server';

test('GET /prospects returns user prospects only', async () => {
  const app = await buildApp();
  const response = await app.inject({
    method: 'GET',
    url: '/prospects',
    headers: { authorization: 'Bearer <test_jwt>' },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json().data).toHaveLength(5);
});
```

**E2E Test (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test('onboarding wizard completes successfully', async ({ page }) => {
  await page.goto('/onboarding');

  // Step 1: Goal selection
  await page.click('text=10-20 Meetings');
  await page.click('text=Continue');

  // Step 2: Industry
  await page.click('text=SaaS & Cloud Software');
  await page.click('text=Continue');

  // ... complete wizard

  await expect(page).toHaveURL('/dashboard');
});
```

---
