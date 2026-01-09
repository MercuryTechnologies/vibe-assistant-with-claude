import { test, expect } from '@playwright/test';

test.describe('Form Components Visual Tests', () => {
  test.describe('DSTextInput', () => {
    test('all text input variants', async ({ page }) => {
      await page.goto('/test-components/ds-text-input/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-text-input-all-variants.png');
    });
  });

  test.describe('DSCombobox', () => {
    test('all combobox variants', async ({ page }) => {
      await page.goto('/test-components/ds-combobox/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-combobox-all-variants.png');
    });
  });

  test.describe('DSCheckbox', () => {
    test('all checkbox variants', async ({ page }) => {
      await page.goto('/test-components/ds-checkbox/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-checkbox-all-variants.png');
    });
  });

  test.describe('DSRadioGroup', () => {
    test('all radio group variants', async ({ page }) => {
      await page.goto('/test-components/ds-radio-group/all');
      
      const container = page.locator('[data-testid="visual-test-container"]');
      await expect(container).toBeVisible();
      
      await expect(container).toHaveScreenshot('ds-radio-group-all-variants.png');
    });
  });
});
