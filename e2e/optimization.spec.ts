/**
 * End-to-End Tests with Playwright
 * Complete user workflow testing
 */

import { test, expect } from '@playwright/test';

test.describe('CV Optimization Flow', () => {
  test('should complete full optimization workflow', async ({ page }) => {
    // Navigate to extension
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Upload CV
    const fileInput = page.locator('#cv-upload');
    await fileInput.setInputFiles('./test-data/sample-cv.pdf');

    // Wait for parsing
    await page.waitForSelector('.cv-preview', { timeout: 5000 });

    // Enter job description
    await page.fill('#job-description', 'Senior Software Engineer with React and Node.js experience');

    // Click optimize button
    await page.click('#optimize-button');

    // Wait for optimizations
    await page.waitForSelector('.optimizations-list', { timeout: 30000 });

    // Verify optimizations appeared
    const optimizations = await page.$$('.optimization-item');
    expect(optimizations.length).toBeGreaterThan(0);

    // Check ATS score
    const score = await page.textContent('.ats-score');
    expect(score).toMatch(/\d+/);

    // Apply first optimization
    await page.click('.optimization-item:first-child .apply-button');

    // Verify applied
    const appliedBadge = await page.locator('.optimization-item:first-child .applied-badge');
    await expect(appliedBadge).toBeVisible();
  });

  test('should display rate limit warnings', async ({ page }) => {
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      await page.click('#optimize-button');
      await page.waitForTimeout(100);
    }

    // Should show rate limit warning
    const warning = page.locator('.rate-limit-warning');
    await expect(warning).toBeVisible({ timeout: 5000 });
  });

  test('should show cost tracking', async ({ page }) => {
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/options/index.html');

    // Navigate to usage tab
    await page.click('text=Usage & Costs');

    // Verify dashboard is visible
    await expect(page.locator('.usage-dashboard')).toBeVisible();

    // Check cost display
    const cost = await page.textContent('.total-cost');
    expect(cost).toMatch(/\$\d+\.\d+/);
  });
});

test.describe('Cover Letter Generation', () => {
  test('should generate cover letter with streaming', async ({ page }) => {
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Navigate to cover letter tab
    await page.click('text=Cover Letter');

    // Enter job description
    await page.fill('#job-description', 'Marketing Manager position');

    // Enable streaming
    await page.check('#enable-streaming');

    // Generate
    await page.click('#generate-cover-letter');

    // Watch streaming updates
    const letterPreview = page.locator('#letter-preview');
    
    // Should update progressively
    await expect(letterPreview).not.toBeEmpty({ timeout: 2000 });
    
    // Wait for completion
    await page.waitForSelector('.generation-complete', { timeout: 30000 });

    // Verify letter content
    const letter = await letterPreview.textContent();
    expect(letter.length).toBeGreaterThan(100);
  });
});

test.describe('Theme Support', () => {
  test('should switch themes', async ({ page }) => {
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/options/index.html');

    // Get initial background color
    const initialBg = await page.evaluate(() => 
      getComputedStyle(document.body).backgroundColor
    );

    // Switch to dark theme
    await page.selectOption('#theme-selector', 'dark');

    // Wait for theme to apply
    await page.waitForTimeout(500);

    const darkBg = await page.evaluate(() => 
      getComputedStyle(document.body).backgroundColor
    );

    // Should be different
    expect(darkBg).not.toBe(initialBg);
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('should execute shortcuts', async ({ page }) => {
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Press Ctrl+O to optimize
    await page.keyboard.press('Control+o');

    // Should trigger optimization
    await expect(page.locator('.optimizing-indicator')).toBeVisible({ timeout: 2000 });
  });

  test('should show shortcuts help', async ({ page }) => {
    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Press Ctrl+/
    await page.keyboard.press('Control+/');

    // Should show shortcuts modal
    await expect(page.locator('.shortcuts-modal')).toBeVisible();

    // Press ESC to close
    await page.keyboard.press('Escape');

    // Should close
    await expect(page.locator('.shortcuts-modal')).not.toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return 429
    await page.route('**/api.openai.com/**', route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_exceeded'
          }
        })
      });
    });

    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Try to optimize
    await page.click('#optimize-button');

    // Should show error with helpful message
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('rate limit');
  });

  test('should fallback to alternative provider', async ({ page }) => {
    // Mock OpenAI to fail, Gemini to succeed
    await page.route('**/api.openai.com/**', route => {
      route.fulfill({ status: 503 });
    });

    await page.route('**/generativelanguage.googleapis.com/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{ text: 'Gemini response' }]
            }
          }]
        })
      });
    });

    await page.goto('chrome-extension://[YOUR_EXTENSION_ID]/src/popup/index.html');

    // Enable fallback in settings
    await page.click('text=Settings');
    await page.check('#enable-fallback');

    // Try optimization
    await page.click('#optimize-button');

    // Should show fallback notification
    await expect(page.locator('text=Switched to Gemini')).toBeVisible({ timeout: 5000 });
  });
});
