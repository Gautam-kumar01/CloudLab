import { test, expect } from '@playwright/test';

test('has title and call to action button', async ({ page }) => {
  // Wait for the dev server
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CloudLab/i);

  // Look for the primary call-to-action link (disambiguated with .first() to prevent strict mode violations)
  const ctaLink = page.getByRole('link', { name: /(Get Started|Start Coding)/i }).first();
  await expect(ctaLink).toBeVisible();
  await expect(ctaLink).toHaveAttribute('href', /\/(sign-up|dashboard)/);
});
