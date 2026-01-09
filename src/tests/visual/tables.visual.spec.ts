import { test, expect } from '@playwright/test';

test.describe('Table Components Visual Tests', () => {
  test.describe('DSTable', () => {
    test('default table variant', async ({ page }) => {
      await page.goto('/test-components/ds-table/default');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-table-default.png');
    });

    test('interactive table variant', async ({ page }) => {
      await page.goto('/test-components/ds-table/interactive');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-table-interactive.png');
    });

    test('all table variants', async ({ page }) => {
      await page.goto('/test-components/ds-table/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-table-all-variants.png');
    });
  });

  test.describe('GroupedTable', () => {
    test('grouped table default', async ({ page }) => {
      await page.goto('/test-components/grouped-table/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('grouped-table-default.png');
    });
  });

  test.describe('DSTableToolbar', () => {
    test('table toolbar', async ({ page }) => {
      await page.goto('/test-components/ds-table-toolbar/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-table-toolbar.png');
    });
  });
});
