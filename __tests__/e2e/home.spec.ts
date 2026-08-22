import { test, expect } from '@playwright/test';

test('has title and Get Started button', async ({ page }) => {
  // Wait for the dev server
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CloudLab/i);

  // Look for the "Get Started" link
  const getStartedLink = page.getByRole('link', { name: /Get Started/i });
  await expect(getStartedLink).toBeVisible();
  await expect(getStartedLink).toHaveAttribute('href', '/dashboard');
});
