import { test, expect } from '@playwright/test';

test.describe('DSButton Visual Tests', () => {
  test('all button variants', async ({ page }) => {
    await page.goto('/test-components/ds-button/all');
    
    // Wait for the container to be visible
    const container = page.locator('[data-testid="visual-test-container"]');
    await expect(container).toBeVisible();
    
    // Take screenshot of all button variants
    await expect(container).toHaveScreenshot('ds-button-all-variants.png');
  });

  test('small button variants', async ({ page }) => {
    await page.goto('/test-components/ds-button/small');
    
    const container = page.locator('[data-testid="visual-test-container"]');
    await expect(container).toBeVisible();
    
    await expect(container).toHaveScreenshot('ds-button-small-variants.png');
  });

  test('large button variants', async ({ page }) => {
    await page.goto('/test-components/ds-button/large');
    
    const container = page.locator('[data-testid="visual-test-container"]');
    await expect(container).toBeVisible();
    
    await expect(container).toHaveScreenshot('ds-button-large-variants.png');
  });
});
