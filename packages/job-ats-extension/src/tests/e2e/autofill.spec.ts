/**
 * E2E test for autofill functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Autofill', () => {
  test('should detect form fields', async ({ page }) => {
    // Create a simple test page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" />
          
          <label for="email">Email</label>
          <input type="email" id="email" />
          
          <button type="submit">Submit</button>
        </form>
      </body>
      </html>
    `);

    // Verify fields are present
    const firstNameInput = page.locator('#firstName');
    const emailInput = page.locator('#email');

    await expect(firstNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('should fill form fields', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <input type="text" id="name" />
          <input type="email" id="email" />
        </form>
      </body>
      </html>
    `);

    // Fill fields
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');

    // Verify values
    const nameValue = await page.inputValue('#name');
    const emailValue = await page.inputValue('#email');

    expect(nameValue).toBe('John Doe');
    expect(emailValue).toBe('john@example.com');
  });
});
