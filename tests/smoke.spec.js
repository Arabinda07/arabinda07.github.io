const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const pageUrl = `file://${path.resolve(__dirname, '../index.html')}`;
const rootDir = path.resolve(__dirname, '..');

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

test('theme toggle updates data-theme, aria state, and persists selection', async ({ page }) => {
  await page.goto(pageUrl);
  const toggle = page.locator('[data-theme-toggle]:visible').first();

  await expect(toggle).toHaveAttribute('role', 'switch');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/);

  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await toggle.click();
  const changedTheme = await page.locator('html').getAttribute('data-theme');

  expect(changedTheme).not.toBe(initialTheme);
  await expect(toggle).toHaveAttribute('aria-checked', changedTheme === 'dark' ? 'true' : 'false');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', changedTheme);
});

test('head exposes canonical, social cards, manifest, and parseable structured data', async ({ page }) => {
  await page.goto(pageUrl);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://arabinda07.github.io/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'site.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', 'assets/apple-touch-icon.png');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://arabinda07.github.io/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://arabinda07.github.io/assets/og-image.png');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://arabinda07.github.io/assets/twitter-image.png');

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.length).toBeGreaterThan(0);
  const graph = JSON.parse(jsonLd.join('\n'));
  expect(graph['@context']).toBe('https://schema.org');
  expect(graph['@graph'].some((item) => item['@type'] === 'Person' && item.name === 'Arabinda Saha')).toBe(true);
  expect(graph['@graph'].some((item) => item['@type'] === 'WebSite' && item.url === 'https://arabinda07.github.io/')).toBe(true);
});

test('planned web assets and SEO files exist', async () => {
  const expectedFiles = [
    'favicon.ico',
    'site.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'assets/favicon-16x16.png',
    'assets/favicon-32x32.png',
    'assets/favicon-96x96.png',
    'assets/apple-touch-icon.png',
    'assets/android-chrome-192x192.png',
    'assets/android-chrome-512x512.png',
    'assets/og-image.png',
    'assets/twitter-image.png',
  ];

  for (const file of expectedFiles) {
    const absolutePath = path.join(rootDir, file);
    expect(fs.existsSync(absolutePath), `${file} should exist`).toBe(true);
    expect(fs.statSync(absolutePath).size, `${file} should not be empty`).toBeGreaterThan(0);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'site.webmanifest'), 'utf8'));
  expect(manifest.icons.map((icon) => icon.src)).toEqual(
    expect.arrayContaining([
      'assets/android-chrome-192x192.png',
      'assets/android-chrome-512x512.png',
    ])
  );
});

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 980 },
]) {
  test(`layout has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(pageUrl);
    await page.waitForTimeout(100);
    const width = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth + 1);
  });
}
