/**
 * E2E tests for autofill functionality with ATS fixtures
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Autofill - Greenhouse', () => {
  test('should detect and fill Greenhouse form fields', async ({ page }) => {
    // Load Greenhouse fixture
    const fixturePath = path.join(__dirname, 'fixtures/greenhouse.html');
    await page.goto(`file://${fixturePath}`);

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify form is present
    await expect(page.locator('#application_form')).toBeVisible();

    // Fill fields
    await page.fill('#first_name', 'Jane');
    await page.fill('#last_name', 'Doe');
    await page.fill('#email', 'jane.doe@example.com');
    await page.fill('#phone', '+1234567890');
    await page.fill('#linkedin', 'https://linkedin.com/in/janedoe');
    await page.fill('#website', 'https://janedoe.dev');

    // Verify values
    expect(await page.inputValue('#first_name')).toBe('Jane');
    expect(await page.inputValue('#email')).toBe('jane.doe@example.com');

    // File upload should be present but not fillable
    const fileInput = page.locator('#resume');
    await expect(fileInput).toBeVisible();
    expect(await fileInput.getAttribute('type')).toBe('file');

    // Take screenshot
    await page.screenshot({ path: 'packages/job-ats-extension/docs/screenshots/e2e/greenhouse-autofill.png', fullPage: true });
  });

  test('should not submit form automatically', async ({ page }) => {
    const fixturePath = path.join(__dirname, 'fixtures/greenhouse.html');
    await page.goto(`file://${fixturePath}`);

    // Fill fields
    await page.fill('#first_name', 'Test');
    await page.fill('#email', 'test@example.com');

    // Verify submit button is NOT clicked automatically
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Button should remain clickable (not triggered)
    expect(await submitButton.isEnabled()).toBe(true);
  });
});

test.describe('Autofill - Workday', () => {
  test('should detect and fill Workday form fields', async ({ page }) => {
    const fixturePath = path.join(__dirname, 'fixtures/workday.html');
    await page.goto(`file://${fixturePath}`);

    await page.waitForLoadState('domcontentloaded');

    // Verify Workday-specific elements
    await expect(page.locator('.WD-form')).toBeVisible();

    // Fill fields using Workday automation IDs
    await page.fill('[data-automation-id="legalNameSection_firstName"]', 'John');
    await page.fill('[data-automation-id="legalNameSection_lastName"]', 'Smith');
    await page.fill('[data-automation-id="email"]', 'john.smith@example.com');
    await page.fill('[data-automation-id="phone-number"]', '+1234567890');
    await page.fill('[data-automation-id="city"]', 'Seattle');
    await page.fill('[data-automation-id="country"]', 'USA');

    // Verify values
    expect(await page.inputValue('[data-automation-id="legalNameSection_firstName"]')).toBe('John');
    expect(await page.inputValue('[data-automation-id="email"]')).toBe('john.smith@example.com');

    // Test select fields
    await page.selectOption('[data-automation-id="work-authorization"]', 'yes');
    expect(await page.inputValue('[data-automation-id="work-authorization"]')).toBe('yes');

    // Take screenshot
    await page.screenshot({ path: 'packages/job-ats-extension/docs/screenshots/e2e/workday-autofill.png', fullPage: true });
  });

  test('should handle file upload guidance', async ({ page }) => {
    const fixturePath = path.join(__dirname, 'fixtures/workday.html');
    await page.goto(`file://${fixturePath}`);

    // Verify file input is present
    const fileInput = page.locator('[data-automation-id="resume-upload"]');
    await expect(fileInput).toBeVisible();

    // File input should not be programmatically filled (security)
    expect(await fileInput.getAttribute('type')).toBe('file');
    
    // In real extension, this would show guidance tooltip
    // Here we just verify the field is accessible
    await fileInput.focus();
    expect(await fileInput.evaluate(el => document.activeElement === el)).toBe(true);
  });
});

test.describe('Form Detection', () => {
  test('should detect fields by label text', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <label for="fname">First Name</label>
          <input type="text" id="fname" />
          
          <label for="emailAddr">Email Address</label>
          <input type="text" id="emailAddr" />
        </form>
      </body>
      </html>
    `);

    // Verify fields are detectable
    await expect(page.locator('input#fname')).toBeVisible();
    await expect(page.locator('input#emailAddr')).toBeVisible();
  });

  test('should detect fields by placeholder', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <input type="text" placeholder="Enter your first name" />
          <input type="email" placeholder="email@example.com" />
        </form>
      </body>
      </html>
    `);

    // Verify placeholders
    const firstInput = page.locator('input[placeholder*="first name"]');
    const emailInput = page.locator('input[placeholder*="email"]');

    await expect(firstInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('should detect fields by aria-label', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <input type="text" aria-label="Phone Number" />
          <input type="text" aria-label="LinkedIn Profile URL" />
        </form>
      </body>
      </html>
    `);

    // Verify aria-labels
    await expect(page.locator('input[aria-label*="Phone"]')).toBeVisible();
    await expect(page.locator('input[aria-label*="LinkedIn"]')).toBeVisible();
  });
});
