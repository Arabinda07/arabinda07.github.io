const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const pageUrl = `file://${path.resolve(__dirname, '../index.html')}`;
const rootDir = path.resolve(__dirname, '..');

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

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

test('experience tabs support keyboard navigation', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  await page.locator('#tab-btn-lks').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-btn-edudigm-ph')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-edudigm-ph')).toHaveClass(/active/);

  await page.keyboard.press('End');
  await expect(page.locator('#tab-btn-edudigm-sme')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-edudigm-sme')).toHaveClass(/active/);

  await page.keyboard.press('Home');
  await expect(page.locator('#tab-btn-lks')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-lks')).toHaveClass(/active/);

  await page.locator('#tab-btn-edudigm-ph').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tab-btn-edudigm-ph')).toHaveAttribute('aria-selected', 'true');
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

test('mobile icon controls meet touch target size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);

  const controls = [
    page.locator('#hamburger'),
    page.locator('.mobile-actions [data-theme-toggle]'),
  ];

  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('reduced motion keeps transitions effectively disabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pageUrl);

  const transitionDurations = await page.evaluate(() => {
    return ['.btn-primary', '.project-card', '.form-input'].map((selector) =>
      window.getComputedStyle(document.querySelector(selector)).transitionDuration
    );
  });

  for (const durationList of transitionDurations) {
    const durations = durationList.split(',').map((duration) => duration.trim());
    expect(durations.every((duration) => {
      const value = Number.parseFloat(duration);
      return duration.endsWith('ms') ? value <= 0.02 : value <= 0.00002;
    })).toBe(true);
  }
});

test('keyboard focus keeps a visible focus ring', async ({ page }) => {
  await page.goto(pageUrl);
  await page.keyboard.press('Tab');

  const focusRing = await page.evaluate(() => {
    const active = document.activeElement;
    const style = window.getComputedStyle(active);
    return {
      tagName: active.tagName,
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(focusRing.tagName).not.toBe('BODY');
  expect(focusRing.outlineStyle).not.toBe('none');
  expect(focusRing.outlineWidth).toBeGreaterThanOrEqual(2);
});

test('hero copy supports BI/data positioning without needy CTA language', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await expect(page.locator('.lp-name')).toHaveText('Arabinda Saha');
  await expect(page.locator('.left-panel .lp-title')).toHaveCount(0);
  await expect(page.locator('.lp-bio')).toHaveText('BI & Data Analyst building dashboards, trackers, and review views for education programs and institutional teams.');
  await expect(page.locator('.left-panel')).toContainText('Talk Through a Problem');
  let visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toContain('Arabinda Saha.');
  expect(visibleText).not.toContain('Data, governance, and programme systems for institutions that need to work at scale.');
  expect(visibleText).not.toContain('My work spans school programmes, assessment design, data workflows, and governance operations.');
  expect(visibleText).not.toContain('Hire me');
  expect(visibleText).not.toContain('Book now');
  expect(visibleText).not.toContain('Looking for work');
  expect(visibleText).not.toContain('Available for freelance');
  expect(visibleText).not.toContain('Selected Website / Storytelling Work');
  expect(visibleText).not.toContain('Freelance Services');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await expect(page.locator('.hero-name')).toHaveText('BI & Data Analyst');
  await expect(page.locator('.hero-sub')).toHaveText('I turn scattered program and business data into dashboards, trackers, and review views teams can use in real decisions.');
  await expect(page.locator('.hero-actions')).toContainText('Talk Through a Problem');
  visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toContain('Arabinda Saha.');
  expect(visibleText).not.toContain('Data, governance, and programme systems for institutions.');
});

test('work section prioritizes analytics proof and keeps product lab distinct', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  const visibleText = await page.locator('body').innerText();

  expect(visibleText).toContain('Analytics & Decision Systems Work');
  expect(visibleText).toContain('Competitive Edge — Diagnostic Assessment Analytics');
  expect(visibleText).toContain('LKS Dashboard & Performance Analytics');
  expect(visibleText).toContain('Anonymized summary');
  expect(visibleText).toContain('School Program Command Centre — Active Prototype');
  expect(visibleText).toContain('synthetic/sample school-program data and has not yet been piloted');
  expect(visibleText).toContain('Reflections');
  expect(visibleText).toContain('Parichay');
  expect(visibleText).not.toContain('Confidential Work');
  expect(visibleText).not.toContain('LKS Internal Dashboard Work — Confidential / Anonymized');
  expect(visibleText).not.toContain('function level only');
  expect(visibleText).not.toContain('Selected Website / Storytelling Work');
  expect(visibleText).not.toContain('Freelance Services');
  expect(visibleText).not.toContain('lower-priority product');
  expect(visibleText).not.toContain('kept secondary');
  expect(visibleText).not.toContain('without competing');

  const order = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      competitiveEdge: text.indexOf('Competitive Edge — Diagnostic Assessment Analytics'),
      commandCentre: text.indexOf('School Program Command Centre — Active Prototype'),
      productLab: text.indexOf('Product Lab'),
    };
  });

  expect(order.competitiveEdge).toBeGreaterThanOrEqual(0);
  expect(order.commandCentre).toBeGreaterThan(order.competitiveEdge);
  expect(order.productLab).toBeGreaterThan(order.competitiveEdge);
});

test('visible copy keeps reporting language restrained', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  const visibleText = await page.locator('body').innerText();
  const reportingMatches = visibleText.match(/\breporting\b/gi) || [];

  expect(reportingMatches.length).toBeLessThanOrEqual(2);
  expect(visibleText).toMatch(/my philosophy/i);
  expect(visibleText).toContain('Making work easier to see.');
  expect(visibleText).toContain('If your team is trying to make sense of a dashboard, data set, program, or page, I’m happy to talk through the problem.');
  expect(visibleText).not.toContain('The same way of working fits BI/reporting analyst conversations');
});

test('about section keeps photo with intro and removes metric strip', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));

  const about = page.locator('#about');
  await expect(about.locator('.proof-strip')).toHaveCount(0);
  await expect(about.locator('.about-photo-mobile')).toHaveCount(0);
  await expect(about.locator('.about-photo img[alt="Arabinda Saha"]')).toBeVisible();
  await expect(about).toContainText('My Philosophy');
  await expect(about).toContainText('Why');
  await expect(about).toContainText('How');
  await expect(about).toContainText('What');

  const aboutText = await about.innerText();
  expect(aboutText).not.toContain('600+ schools reached');
  expect(aboutText).not.toContain('1,500+ students covered');
  expect(aboutText).not.toContain('60+ teachers coordinated');
  expect(aboutText).not.toContain('~1,000 students in assessment analytics');
  expect(aboutText).not.toContain('Python Pandas · Plotly · Excel · Sheets · SQL');

  const desktopOrder = await about.evaluate((section) => {
    const text = section.innerText;
    return {
      aboutContext: text.indexOf('I work at the intersection'),
      philosophy: text.indexOf('Making work easier to see.'),
    };
  });
  expect(desktopOrder.aboutContext).toBeGreaterThanOrEqual(0);
  expect(desktopOrder.philosophy).toBeGreaterThan(desktopOrder.aboutContext);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  await expect(page.locator('#about .about-photo img[alt="Arabinda Saha"]')).toBeVisible();
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

test('visible resume links stay on one line', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await page.click('#hamburger');
  await expect(page.locator('.mobile-nav')).toHaveClass(/is-open/);
  await expect(page.locator('.btn-resume')).toBeVisible();
  await expect(page.locator('.mobile-nav .btn-resume')).toHaveCSS('border-radius', '0px');

  const mobileResumeMetrics = await page.locator('.mobile-nav .btn-resume').evaluate((link) => {
    const rect = link.getBoundingClientRect();
    const style = window.getComputedStyle(link);
    return {
      width: rect.width,
      minHeight: parseFloat(style.minHeight),
      justifyContent: style.justifyContent,
    };
  });
  expect(mobileResumeMetrics.width).toBeGreaterThan(300);
  expect(mobileResumeMetrics.minHeight).toBeGreaterThanOrEqual(44);
  expect(mobileResumeMetrics.justifyContent).toBe('space-between');

  await page.setViewportSize({ width: 1440, height: 720 });
  await page.goto(pageUrl);
  await expect(page.locator('.left-panel .lp-resume-btn')).toBeVisible();

  const wrappingIssues = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.lp-resume-btn, .btn-resume'))
      .filter((link) => {
        const style = window.getComputedStyle(link);
        const rect = link.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (style.whiteSpace !== 'nowrap' || rect.height > 52);
      })
      .map((link) => link.className);
  });

  expect(wrappingIssues).toEqual([]);
});

test('head exposes canonical, social cards, manifest, and parseable structured data', async ({ page }) => {
  await page.goto(pageUrl);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://arabinda07.github.io/');
  await expect(page).toHaveTitle('Arabinda Saha — Business Intelligence & Data Analyst');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Business Intelligence & Data Analyst/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /dashboards/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /education analytics/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /India/);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'site.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', 'assets/apple-touch-icon.png');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://arabinda07.github.io/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://arabinda07.github.io/assets/og-image.png');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /Portfolio of Arabinda Saha/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://arabinda07.github.io/assets/twitter-image.png');
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', /Portfolio of Arabinda Saha/);
  await expect(page.locator('meta[property="og:image:alt"]')).not.toHaveAttribute('content', /business intelligence focus|data systems/i);
  await expect(page.locator('meta[name="twitter:image:alt"]')).not.toHaveAttribute('content', /business intelligence focus|data systems/i);
  await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute('content', /data systems/i);
  await expect(page.locator('meta[name="twitter:description"]')).not.toHaveAttribute('content', /data systems/i);

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.length).toBeGreaterThan(0);
  const graph = JSON.parse(jsonLd.join('\n'));
  expect(graph['@context']).toBe('https://schema.org');
  const person = graph['@graph'].find((item) => item['@type'] === 'Person' && item.name === 'Arabinda Saha');
  expect(person).toBeTruthy();
  expect(person.jobTitle).toBe('Business Intelligence & Data Analyst');
  expect(person.description).toContain('Business Intelligence and Data Analyst in India');
  expect(person.knowsAbout).toEqual(expect.arrayContaining(['Plotly', 'Google Sheets', 'Decision views']));
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
    'assets/photo-320.webp',
    'assets/photo-480.webp',
    'assets/og-image.png',
    'assets/og-square.png',
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
  expect(manifest.description).toContain('Business Intelligence and Data Analyst in India');

  const expectedDimensions = {
    'assets/favicon-16x16.png': [16, 16],
    'assets/favicon-32x32.png': [32, 32],
    'assets/favicon-96x96.png': [96, 96],
    'assets/apple-touch-icon.png': [180, 180],
    'assets/android-chrome-192x192.png': [192, 192],
    'assets/android-chrome-512x512.png': [512, 512],
    'assets/og-image.png': [1200, 630],
    'assets/twitter-image.png': [1200, 675],
    'assets/og-square.png': [1200, 1200],
  };

  for (const [file, [width, height]] of Object.entries(expectedDimensions)) {
    expect(readPngSize(path.join(rootDir, file))).toEqual({ width, height });
  }
});

test('AI-readable and sitemap files match current SEO positioning', async () => {
  const llmsText = fs.readFileSync(path.join(rootDir, 'llms.txt'), 'utf8');
  expect(llmsText).toContain('Business Intelligence & Data Analyst');
  expect(llmsText).toContain('Best-fit opportunities');
  expect(llmsText).toContain('LKS Dashboard & Performance Analytics');
  expect(llmsText).not.toContain('LKS Internal Dashboard Work - Confidential / Anonymized');
  expect(llmsText).not.toContain('LKS Internal Dashboard Work — Confidential / Anonymized');

  const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
  expect(sitemap).toContain('<lastmod>2026-05-24</lastmod>');
});

test('warm accent system has no retired blue or legacy alias CSS tokens', async () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  expect(css).not.toMatch(/--color-blue/);
  expect(css).not.toMatch(/--navy/);
  expect(css).not.toMatch(/--teal/);
  expect(css).not.toMatch(/--slate/);
  expect(css).toMatch(/--color-secondary/);
  expect(css).toMatch(/--color-secondary-tint/);
});

test('design system document exists with required sections', async () => {
  const designPath = path.join(rootDir, 'DESIGN.md');
  expect(fs.existsSync(designPath), 'DESIGN.md should exist').toBe(true);

  const designDoc = fs.readFileSync(designPath, 'utf8');
  expect(designDoc).toContain('name: Arabinda Saha Portfolio');
  expect(designDoc).toContain('Creative North Star: "Decision Studio"');
  expect(designDoc).toContain('44px icon controls');

  const requiredHeadings = [
    '## Overview',
    '## Colors',
    '## Typography',
    '## Elevation',
    '## Components',
    "## Do's and Don'ts",
  ];

  const positions = requiredHeadings.map((heading) => designDoc.indexOf(heading));
  positions.forEach((position, index) => {
    expect(position, `${requiredHeadings[index]} should exist`).toBeGreaterThanOrEqual(0);
    if (index > 0) expect(position).toBeGreaterThan(positions[index - 1]);
  });
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
