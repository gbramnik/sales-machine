import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const json = (payload: unknown) => ({
  status: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});

const stubApi = async (
  page: Page,
  onboardingResponse: { completed: boolean; pendingStep?: string; checklist?: unknown[] }
) => {
  await page.route('http://localhost:3000/**', async (route) => {
    const url = route.request().url();

    if (url.endsWith('/onboarding/status')) {
      await route.fulfill(
        json({
          success: true,
          data: onboardingResponse,
        })
      );
      return;
    }

    if (url.endsWith('/onboarding/complete')) {
      await route.fulfill(
        json({
          success: true,
          data: { completed: true },
        })
      );
      return;
    }

    await route.fulfill(
      json({
        success: true,
        data: null,
      })
    );
  });
};

test.describe('Onboarding guard & dashboard access', () => {
  test('redirects first-time users to the onboarding wizard', async ({ page }) => {
    await stubApi(page, {
      completed: false,
      pendingStep: 'goal_selection',
      checklist: [],
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: /let's get your ai sales rep configured/i })).toBeVisible();
  });

  test('allows dashboard access after onboarding completion', async ({ page }) => {
    await stubApi(page, {
      completed: true,
      pendingStep: 'complete',
      checklist: [],
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByText(/Finish onboarding to unlock/i)).toHaveCount(0);
  });
});

