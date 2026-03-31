const { test, expect } = require('@playwright/test');
const path = require('path');

const pageUrl = `file://${path.resolve(__dirname, '../index.html')}`;

test('invalid email shows validation error', async ({ page }) => {
  await page.goto(pageUrl);
  await page.fill('#from_name', 'Test User');
  await page.fill('#reply_to', 'not-an-email');
  await page.fill('#message', 'Hello from smoke test');
  await page.click('#form-submit');
  await expect(page.locator('#form-status')).toContainText('Please enter a valid email address.');
});

test('tab switch updates selected button and active panel', async ({ page }) => {
  await page.goto(pageUrl);
  await page.click('#tab-btn-edudigm-ph');
  await expect(page.locator('#tab-btn-edudigm-ph')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-edudigm-ph')).toHaveClass(/active/);
});

test('mobile nav toggles aria-expanded correctly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  const hamburger = page.locator('#hamburger');
  await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
});
