import { test, expect } from '@playwright/test';

test.describe('Miscellaneous Components Visual Tests', () => {
  test.describe('Badge', () => {
    test('all badge variants', async ({ page }) => {
      await page.goto('/test-components/badge/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('badge-all-variants.png');
    });
  });

  test.describe('FilterMenu', () => {
    test('filter menu default', async ({ page }) => {
      await page.goto('/test-components/filter-menu/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('filter-menu-default.png');
    });
  });

  test.describe('InlineCombobox', () => {
    test('inline combobox variants', async ({ page }) => {
      await page.goto('/test-components/inline-combobox/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('inline-combobox-all.png');
    });
  });

  test.describe('MonthlySummary', () => {
    test('monthly summary variants', async ({ page }) => {
      await page.goto('/test-components/monthly-summary/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('monthly-summary-all.png');
    });
  });

  test.describe('GroupByButton', () => {
    test('group by button', async ({ page }) => {
      await page.goto('/test-components/group-by-button/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('group-by-button.png');
    });
  });

  test.describe('SortButton', () => {
    test('sort button', async ({ page }) => {
      await page.goto('/test-components/sort-button/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('sort-button.png');
    });
  });
});
