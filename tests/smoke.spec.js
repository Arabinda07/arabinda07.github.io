const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const pageUrl = `file://${path.resolve(__dirname, '../index.html')}`;
const rootDir = path.resolve(__dirname, '..');

function parseOklch(value) {
  const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/);
  if (!match) throw new Error(`Expected OKLCH color, got ${value}`);
  return {
    l: Number.parseFloat(match[1]),
    c: Number.parseFloat(match[2]),
    h: Number.parseFloat(match[3]),
  };
}

function oklchToSrgb(value) {
  const { l, c, h } = parseOklch(value);
  const hue = h * Math.PI / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);

  let lmsL = l + 0.3963377774 * a + 0.2158037573 * b;
  let lmsM = l - 0.1055613458 * a - 0.0638541728 * b;
  let lmsS = l - 0.0894841775 * a - 1.2914855480 * b;

  lmsL = lmsL ** 3;
  lmsM = lmsM ** 3;
  lmsS = lmsS ** 3;

  const linear = [
    4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS,
    -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS,
    -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.7076147010 * lmsS,
  ].map((channel) => Math.min(1, Math.max(0, channel)));

  return linear.map((channel) =>
    channel <= 0.0031308 ? 12.92 * channel : 1.055 * (channel ** (1 / 2.4)) - 0.055
  );
}

function relativeLuminance(rgb) {
  const linear = rgb.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const fg = relativeLuminance(oklchToSrgb(foreground));
  const bg = relativeLuminance(oklchToSrgb(background));
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readPngColorType(filePath) {
  return fs.readFileSync(filePath)[25];
}

function readJpegSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error(`Invalid JPEG marker in ${filePath}`);
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += 2 + length;
  }
  throw new Error(`Could not read JPEG size for ${filePath}`);
}

function readWebpSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`Expected WebP file, got ${filePath}`);
  }

  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }

  if (chunk === 'VP8 ') {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  throw new Error(`Unsupported WebP chunk ${chunk} in ${filePath}`);
}

test('invalid email shows validation error', async ({ page }) => {
  await page.goto(pageUrl);
  await page.fill('#from_name', 'Test User');
  await page.fill('#reply_to', 'not-an-email');
  await page.getByLabel('BI, analytics, dashboards, or operations support').check();
  await page.fill('#message', 'Hello from smoke test');
  await page.click('#form-submit');
  await expect(page.locator('#form-status')).toContainText('Please enter a valid email address.');
});

test('contact form requires a conversation intent', async ({ page }) => {
  await page.goto(pageUrl);
  await page.fill('#from_name', 'Test User');
  await page.fill('#reply_to', 'test@example.com');
  await page.fill('#message', 'Hello from smoke test');
  await page.click('#form-submit');
  await expect(page.locator('#form-status')).toContainText('Please fill in all fields to start the conversation.');
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
  await expect(page.locator('.mobile-nav .btn-primary')).toHaveText('Start a conversation');
  await expect(page.locator('.mobile-nav .btn-primary')).toBeVisible();
  await expect(page.locator('#mobile-header')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.left-panel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero-section')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#mobile-nav')).not.toHaveAttribute('aria-hidden', 'true');
  const mobileCtaContrast = await page.locator('.mobile-nav .btn-primary').evaluate((link) => {
    const style = window.getComputedStyle(link);
    return {
      color: style.color,
      background: style.backgroundColor,
    };
  });
  expect(mobileCtaContrast.color).not.toBe(mobileCtaContrast.background);
  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#mobile-nav')).toHaveAttribute('aria-hidden', 'true');
});

test('desktop and mobile layout regions expose only the active navigation surface', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await expect(page.locator('#mobile-header')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#mobile-nav')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.left-panel')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero-section')).toHaveAttribute('aria-hidden', 'true');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await expect(page.locator('#mobile-header')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#mobile-nav')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.left-panel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero-section')).not.toHaveAttribute('aria-hidden', 'true');
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

test('standalone navigation affordances meet target size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);

  const mobileLogo = await page.locator('.mobile-logo').boundingBox();
  expect(mobileLogo).not.toBeNull();
  expect(mobileLogo.width).toBeGreaterThanOrEqual(44);
  expect(mobileLogo.height).toBeGreaterThanOrEqual(44);

  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  const sideRailEmail = await page.locator('.side-rail__email').boundingBox();
  expect(sideRailEmail).not.toBeNull();
  expect(Math.min(sideRailEmail.width, sideRailEmail.height)).toBeGreaterThanOrEqual(44);
});

test('philosophy block and left panel use editorial spacing contracts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  await page.locator('#about').scrollIntoViewIfNeeded();

  const focusCardStyle = await page.locator('.focus-card').first().evaluate((element) => {
    const style = window.getComputedStyle(element);
    const paragraph = element.querySelector('p');
    return {
      backgroundColor: style.backgroundColor,
      borderLeftWidth: Number.parseFloat(style.borderLeftWidth),
      borderBottomWidth: Number.parseFloat(style.borderBottomWidth),
      paragraphWidth: paragraph.getBoundingClientRect().width,
    };
  });

  expect(focusCardStyle.backgroundColor).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);
  expect(focusCardStyle.borderLeftWidth).toBe(0);
  expect(focusCardStyle.borderBottomWidth).toBeGreaterThanOrEqual(1);
  expect(focusCardStyle.paragraphWidth).toBeGreaterThanOrEqual(340);

  await page.locator('#work').scrollIntoViewIfNeeded();
  const navLineWidths = await page.locator('.left-panel .nav-line').evaluateAll((lines) =>
    lines.map((line) => line.getBoundingClientRect().width)
  );
  expect(Math.max(...navLineWidths)).toBeLessThanOrEqual(46);

  const desktopSocialTargets = await page.locator('.left-panel .lp-social-row a, .left-panel .lp-social-row button').evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  );
  expect(desktopSocialTargets.length).toBeGreaterThanOrEqual(4);
  expect(desktopSocialTargets.every((size) => size.width >= 44 && size.height >= 44)).toBeTruthy();
});

test('desktop active navigation exposes aria-current', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));

  await page.locator('#work').scrollIntoViewIfNeeded();
  await expect(page.locator('.nav-item[data-section="work"] a')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.nav-item[data-section="about"] a')).not.toHaveAttribute('aria-current', 'true');
});

test('tab indicator motion is transform based', async () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  const tabIndicatorBlock = css.match(/\.tab-indicator\s*\{[^}]+\}/)?.[0] || '';

  expect(tabIndicatorBlock).toContain('transform:');
  expect(tabIndicatorBlock).not.toMatch(/transition:[^;]*(\btop\b|\bheight\b)/);
  expect(css).not.toMatch(/\.tab-btn\s*\{[^}]*border-left:\s*2px/s);
  expect(css).not.toMatch(/\.tab-btn\.active\s*\{[^}]*border-left-color/s);
});

test('skip link motion stays transform based', async () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  const skipLinkBlock = css.match(/\.skip-link\s*\{[^}]+\}/)?.[0] || '';
  const skipLinkFocusBlock = css.match(/\.skip-link:focus\s*\{[^}]+\}/)?.[0] || '';

  expect(skipLinkBlock).toContain('transform:');
  expect(skipLinkBlock).toContain('transition: transform');
  expect(skipLinkBlock).not.toMatch(/transition:[^;]*\btop\b/);
  expect(skipLinkFocusBlock).toContain('transform: translateY(0)');
});

test('contact router uses modern local JavaScript patterns', async () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  expect(html).toContain('Array.from(document.querySelectorAll(\'.tab-btn\'))');
  expect(html).not.toContain('Array.prototype.slice.call(document.querySelectorAll(\'.tab-btn\'))');
  expect(html).toContain('const intent = contactForm.collaboration_intent.value;');
});

test('social and decorative links avoid placeholder or noisy accessible text', async ({ page }) => {
  await page.goto(pageUrl);

  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await expect(page.locator('.social-icon[aria-label="WhatsApp"]')).toHaveCount(0);
  await expect(page.locator('.footer__social[aria-label="WhatsApp"]')).toHaveCount(0);
  await expect(page.locator('.contact-direct-link[href="https://wa.me/917031584487"]')).toHaveCount(1);

  const certDots = page.locator('.cert-dot');
  const dotCount = await certDots.count();
  expect(dotCount).toBeGreaterThan(0);
  for (let index = 0; index < dotCount; index += 1) {
    await expect(certDots.nth(index)).toHaveAttribute('aria-hidden', 'true');
  }
});

test('light muted text token meets AA contrast on core surfaces', async () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  const token = (name) => {
    const match = css.match(new RegExp(`${name}:\\s*(oklch\\([^)]+\\))`));
    if (!match) throw new Error(`Missing token ${name}`);
    return match[1];
  };

  const muted = token('--color-text-muted');
  for (const surface of ['--color-canvas', '--color-surface', '--color-surface-raised']) {
    expect(contrastRatio(muted, token(surface))).toBeGreaterThanOrEqual(4.5);
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

test('hero copy supports consultant and interface architect positioning without needy CTA language', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  await expect(page.locator('.lp-name')).toHaveText('Arabinda Saha');
  await expect(page.locator('.left-panel .lp-title')).toHaveCount(0);
  const corePromise = 'I build business intelligence systems, dashboard workflows, and web products that make the work, numbers, and next step easier to see.';
  await expect(page.locator('.lp-bio')).toHaveText(corePromise);
  await expect(page.locator('.left-panel')).toContainText('Start a conversation');
  await expect(page.locator('.left-panel .lp-social-row')).toHaveCount(1);
  await expect(page.locator('.left-panel .lp-action-row')).toHaveCount(1);
  await expect(page.locator('.left-panel .lp-action-row .btn-primary')).toContainText('Start a conversation');
  await expect(page.locator('.left-panel .lp-action-row .lp-resume-btn')).toContainText('Download Resume');
  await expect(page.locator('.left-panel')).not.toContainText('Discuss BI Roles');
  let visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toContain('Arabinda Saha.');
  expect(visibleText).not.toContain('Data, governance, and programme systems for institutions that need to work at scale.');
  expect(visibleText).not.toContain('My work spans school programmes, assessment design, data workflows, and governance operations.');
  expect(visibleText).not.toContain('Hire me');
  expect(visibleText).not.toContain('Book now');
  expect(visibleText).not.toContain('Looking for work');
  expect(visibleText).not.toContain('Available for freelance');
  await expect(page.locator('#gateway')).toHaveCount(0);
  expect(visibleText).not.toContain('Choose the evidence path');
  expect(visibleText).not.toContain('One operating brain, two conversion paths');
  expect(visibleText).not.toContain('strongest proof');
  expect(visibleText).not.toContain('proof is taste plus execution');
  expect(visibleText).not.toContain('Use this path');
  expect(visibleText).not.toContain('conversion paths');
  expect(visibleText).not.toContain('Verified outcomes stay separate from target-stack positioning');
  expect(visibleText).not.toContain('Tools and models I am positioning around');
  expect(visibleText).not.toContain('This matrix separates');
  expect(visibleText).toContain('Business intelligence and education analytics work first, with program operations and selected web/product showcases kept in their own lane.');
  expect(visibleText).not.toMatch(/Product Ops Stack/i);
  expect(visibleText).not.toContain('Target Product Ops Stack');
  expect(visibleText).not.toContain('Product Operations & Data Consultant');
  expect(visibleText).not.toContain('BI & Data Consultant');
  const firstFoldArtifacts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.proof-artifact, .work-media, .project-media'))
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
      })
      .map((node) => node.className)
  );
  expect(firstFoldArtifacts).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await expect(page.locator('.mobile-logo')).toHaveText('Business Intelligence & Interface Architect');
  await expect(page.locator('.hero-name')).toHaveText('Arabinda Saha');
  await expect(page.locator('.hero-sub')).toHaveText(corePromise);
  await expect(page.locator('.hero-actions')).toContainText('Start a conversation');
  await expect(page.locator('.hero-actions')).not.toContainText('Discuss BI Roles');
  await expect(page.locator('.hero-actions a')).toHaveCount(2);
  await expect(page.locator('.hero-actions')).toContainText('Download Resume');
  await expect(page.locator('.hero-actions')).not.toContainText('Review Enterprise Systems');
  await expect(page.locator('.hero-actions')).not.toContainText('View Creative Web Projects');
  visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toContain('Arabinda Saha.');
  expect(visibleText).not.toContain('Data, governance, and programme systems for institutions.');
  expect(visibleText).not.toContain('I turn scattered data into dashboards, reports, and decision views for education programs and institutional teams.');
});

test('mobile about leads with portrait before body copy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);

  const order = await page.evaluate(() => {
    const about = document.querySelector('#about');
    const heading = about.querySelector('.section-heading');
    const photo = about.querySelector('.about-photo');
    const intro = about.querySelector('.section-intro');
    const body = about.querySelector('.about-text');
    return {
      afterHeading: Boolean(heading.compareDocumentPosition(photo) & Node.DOCUMENT_POSITION_FOLLOWING),
      beforeIntro: Boolean(photo.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING),
      beforeBody: Boolean(photo.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING),
    };
  });

  expect(order.afterHeading).toBe(true);
  expect(order.beforeIntro).toBe(true);
  expect(order.beforeBody).toBe(true);
});

test('work section prioritizes analytics proof and keeps web showcases distinct', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  const visibleText = await page.locator('body').innerText();

  expect(visibleText).toContain('Business Intelligence & Analytics');
  expect(visibleText).toContain('Competitive Edge — Diagnostic Assessment Analytics');
  expect(visibleText).toContain('LKS Internal Performance Dashboard Work');
  expect(visibleText).toContain('CBSE Sahodaya 2024');
  expect(visibleText).toContain('remediation planning');
  expect(visibleText).toContain('school-level academic feedback');
  expect(visibleText).toContain('Functional view only; internal data protected.');
  expect(visibleText).not.toContain('Confidential');
  expect(visibleText).not.toContain('confidential');
  expect(visibleText).not.toContain('No internal data shown');
  expect(visibleText).not.toContain('Anonymized summary');
  expect(visibleText).not.toContain('Verified proof');
  expect(visibleText).toContain('School Program Command Centre — Active Prototype');
  expect(visibleText).toContain('It uses synthetic/sample school-program data and has not been piloted yet.');
  expect(visibleText).toContain('Reflections');
  expect(visibleText).toContain('Parichay');
  expect(visibleText).toMatch(/view project/i);
  expect(visibleText).not.toMatch(/open project/i);
  expect(visibleText).not.toMatch(/visit project/i);
  expect(visibleText).not.toContain('View live');
  await expect(page.locator('a[href="https://project-t2dax.vercel.app/"]')).toContainText('View project');
  await expect(page.locator('a[href="https://www.reflections-sanctuary.space/"]')).toContainText('View project');
  await expect(page.locator('a[href="https://parichay-your-story.vercel.app/"]')).toContainText('View project');
  await expect(page.locator('#creative-track + .projects-grid .project-link')).toHaveText([
    /View project/,
    /View project/,
    /View project/,
  ]);
  expect(visibleText).toContain('Web & Product Showcases');
  expect(visibleText).not.toMatch(/\breporting\b/i);
  expect(visibleText).not.toContain('Amplitude');
  expect(visibleText).not.toContain('Mixpanel');
  expect(visibleText).not.toContain('Snowflake SQL');
  await expect(page.locator('.work-media[aria-label="Competitive Edge assessment program photos"] img')).toHaveCount(2);
  await expect(page.locator('.work-media[aria-label="Career assessment pilot photos"] img')).toHaveCount(2);
  await expect(page.locator('.work-media[aria-label="Stellar Space Quiz event photos"] [data-gallery-next]')).toHaveCount(1);
  await expect(page.locator('.work-media[aria-label="School programs and STEM photos"] img')).toHaveCount(2);
  await expect(page.locator('.work-media[aria-label="School programs and STEM photos"] [data-gallery-prev]')).toHaveCount(1);
  const galleryArrowSizes = await page.locator('.work-media__arrow').evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  );
  expect(galleryArrowSizes.every((size) => size.width >= 44 && size.height >= 44)).toBeTruthy();
  await expect(page.locator('.featured-project--text-only .fp-title')).toContainText('LKS Internal Performance Dashboard Work');
  await expect(page.locator('.featured-project--text-only .fp-image')).toHaveCount(0);
  await expect(page.locator('.work-media img').first()).toHaveAttribute('src', /assets\/work-photos\/optimized\/competitive-edge\/01-competitive-edge-dbsk-june-768w\.webp/);
  await expect(page.locator('.work-media img').first()).toHaveAttribute('srcset', /01-competitive-edge-dbsk-june-480w\.webp 480w/);
  await expect(page.locator('.work-media img').first()).toHaveAttribute('srcset', /01-competitive-edge-dbsk-june-768w\.webp 768w/);
  await expect(page.locator('.work-media img').first()).toHaveAttribute('srcset', /01-competitive-edge-dbsk-june\.webp 1599w/);
  await expect(page.locator('#creative-track + .projects-grid .showcase-media')).toHaveCount(0);
  await expect(page.locator('#creative-track + .projects-grid img')).toHaveCount(0);
  await expect(page.locator('#creative-track + .projects-grid [data-gallery-next]')).toHaveCount(0);
  await expect(page.locator('#creative-track + .projects-grid .project-card--showcase')).toHaveCount(0);
  await expect(page.locator('#creative-track + .projects-grid .project-card--text-only')).toHaveCount(3);
  await expect(page.locator('#creative-track + .projects-grid .project-status')).toHaveCount(3);
  await expect(page.locator('#creative-track + .projects-grid')).toContainText('Active prototype · synthetic data');
  await expect(page.locator('#creative-track + .projects-grid')).toContainText('Writing-first journal · live app');
  await expect(page.locator('#creative-track + .projects-grid')).toContainText('Intro-page studio · live app');
  await expect(page.locator('#creative-track + .projects-grid')).toContainText('Reflections: Private Writing Journal');
  await expect(page.locator('#creative-track + .projects-grid')).toContainText('Parichay: Private Intro Page Studio');
  expect(visibleText).not.toContain('Focused workspace · live web app');
  expect(visibleText).not.toContain('Storefront · story-led page');
  expect(visibleText).not.toContain('concrete privacy cues');
  expect(visibleText).not.toContain('hard-conversation context');
  expect(visibleText).not.toContain('Optional Insights');
  expect(visibleText).not.toContain('optional pattern-noticing support');
  expect(visibleText).toContain('optional writing insights');
  expect(visibleText).toContain('clear privacy cues');
  expect(visibleText).toContain('difficult-conversation context');
  expect(visibleText).toContain('Writing Insights');
  await expect(page.locator('.about-photo--mobile img[alt="Arabinda Saha"][loading="eager"][fetchpriority="high"]')).toHaveCount(1);
  await expect(page.locator('.about-photo--desktop img[alt="Arabinda Saha"][loading="eager"][fetchpriority="high"]')).toHaveCount(1);
  await expect(page.locator('img[alt="Arabinda Saha"]').first()).toHaveAttribute('src', 'assets/profile-540.webp');
  await expect(page.locator('img[alt="Arabinda Saha"]').first()).toHaveAttribute('srcset', /assets\/profile-1080\.webp/);
  await expect(page.locator('.featured-project .fp-image-placeholder')).toHaveCount(0);
  expect(visibleText).not.toContain('reducing cloud infrastructure compute overhead by an estimated 20%');
  expect(visibleText).not.toContain('Eliminated reporting discrepancies across business units');
  expect(visibleText).not.toContain('LKS Internal Dashboard Work — Confidential / Anonymized');
  expect(visibleText).not.toContain('Scaling Decentralized Operational Tracking Across 600+ Schools');
  expect(visibleText).not.toContain('Confidential Metric Alignment & Leadership Decision Views');
  expect(visibleText).not.toContain('function level only');
  expect(visibleText).not.toContain('Selected Website / Storytelling Work');
  expect(visibleText).not.toContain('Freelance Services');
  expect(visibleText).not.toContain('lower-priority product');
  expect(visibleText).not.toContain('kept secondary');
  expect(visibleText).not.toContain('without competing');

  const order = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      lks: text.indexOf('LKS Internal Performance Dashboard Work'),
      competitiveEdge: text.indexOf('Competitive Edge — Diagnostic Assessment Analytics'),
      careerAssessment: text.indexOf('Career Assessment Tool'),
      stellarSpace: text.indexOf('Stellar Space Quiz'),
      schoolPrograms: text.indexOf('School Programs, STEM & LMS Work'),
      commandCentre: text.indexOf('School Program Command Centre — Active Prototype'),
      productLab: text.indexOf('Web & Product Showcases'),
    };
  });

  expect(order.lks).toBeGreaterThanOrEqual(0);
  expect(order.competitiveEdge).toBeGreaterThanOrEqual(0);
  expect(order.competitiveEdge).toBeGreaterThan(order.lks);
  expect(order.careerAssessment).toBeGreaterThan(order.competitiveEdge);
  expect(order.stellarSpace).toBeGreaterThan(order.careerAssessment);
  expect(order.schoolPrograms).toBeGreaterThan(order.stellarSpace);
  expect(order.commandCentre).toBeGreaterThan(order.competitiveEdge);
  expect(order.productLab).toBeGreaterThan(order.competitiveEdge);
});

test('visible contact copy keeps the conversation router direct', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  const visibleText = await page.locator('body').innerText();

  expect(visibleText).toMatch(/my philosophy/i);
  expect(visibleText).toContain('Make the work easier to see.');
  expect(visibleText).toContain("Let's talk about the problem");
  expect(visibleText).toMatch(/i want to discuss/i);
  expect(visibleText).toContain('BI, analytics, dashboards, or operations support');
  expect(visibleText).toContain('Custom landing page, portfolio, or UI/UX project');
  expect(visibleText).toContain('Academic or research collaboration');
  expect(visibleText).toContain('Something else entirely');
  expect(visibleText).toMatch(/message on whatsapp/i);
  expect(visibleText).toMatch(/what would you like to discuss\?/i);
  expect(visibleText).toMatch(/start a conversation/i);
  expect(visibleText).toContain('One clear note is enough: what you are trying to understand, build, or improve.');
  expect(visibleText).not.toMatch(/no polished brief needed\./i);
  expect(visibleText).not.toContain('Send the rough version.');
  expect(visibleText).not.toContain('A broken tracker, a confusing report, school data, or a page that is not landing yet. A few lines are fine.');
  expect(visibleText).not.toMatch(/a small note is enough\./i);
  expect(visibleText).not.toContain('If the work is messy, send it through.');
  expect(visibleText).not.toContain('A dashboard, a tracker, a school-program report, or a page you can’t quite explain yet. I’ll read it and reply.');
  expect(visibleText).not.toMatch(/have something messy to make clear\?/i);
  expect(visibleText).not.toContain('Send me the problem. I’ll help make sense of it.');
  expect(visibleText).not.toContain('Dashboards, trackers, reports, school-program data, or a page that needs clearer structure.');
  expect(visibleText).not.toMatch(/BI \/ data \/ dashboard work/i);
  expect(visibleText).not.toContain('Bring me a messy dashboard, tracker, or reporting workflow.');
  expect(visibleText).not.toContain('I’ll help make the question, data, and next decision easier to see.');
  expect(visibleText).not.toContain('If you’re hiring for BI, data, dashboard, reporting, or analytics-heavy operations work, I’d be glad to talk.');
  expect(visibleText).not.toContain('Also open to selected dashboard, reporting template, and portfolio/page clarity projects.');
  expect(visibleText).not.toContain('Hiring for BI/Data roles, analytics-heavy business roles, or institutional reporting work?');
  expect(visibleText).not.toContain('Kolkata, Bengaluru, Hyderabad, Gurugram, Pune, Mumbai, and remote India');
  expect(visibleText).not.toContain('selected freelance projects for school dashboards, reporting templates, portfolio sites, and storytelling-led landing pages');
  await expect(page.locator('.contact-intro')).toHaveCount(0);
  await expect(page.locator('.contact-layout')).toHaveCount(0);
  await expect(page.locator('.contact-copy')).toHaveCount(0);
  await expect(page.locator('.contact-direct')).toHaveCount(1);
  await expect(page.locator('.contact-form-panel')).toHaveCount(1);
  await expect(page.locator('.contact-form-intro')).toHaveCount(1);
  await expect(page.locator('#contact-form')).toHaveCount(1);
  await expect(page.locator('input[name="from_name"]')).toHaveCount(1);
  await expect(page.locator('input[name="reply_to"]')).toHaveCount(1);
  await expect(page.locator('input[name="collaboration_intent"]')).toHaveCount(4);
  await expect(page.locator('textarea[name="message"]')).toHaveCount(1);
  await expect(page.locator('input[name="collaboration_intent"]').first()).toHaveAttribute('required', '');
  await expect(page.locator('.contact-actions')).toHaveCount(0);
  await expect(page.locator('.contact-direct .email-link')).toHaveCount(0);
  await expect(page.locator('.contact-direct-link[href="https://wa.me/917031584487"]')).toHaveText(/Message on WhatsApp/);
  await expect(page.locator('.contact-split')).toHaveCount(0);
  await expect(page.locator('.contact-card')).toHaveCount(0);
  expect(visibleText).not.toContain('Recruiters & Founders');
  expect(visibleText).not.toContain('Creative Clients');
  expect(visibleText).not.toContain('Download BI Resume');
  expect(visibleText).not.toContain('Book Design Consultation');
  expect(visibleText).not.toContain('[cite: 1]');
  expect(visibleText).not.toContain('classical fine arts');
  expect(visibleText).not.toContain('Eliminated reporting discrepancies across business units');
});

test('contact polish keeps dark-mode selectors and compact mobile density', async ({ page }) => {
  const css = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  expect(css).toContain('html[data-theme="dark"] .contact-form-panel');
  expect(css).toContain('html[data-theme="dark"] .contact-form-intro');
  expect(css).toContain('html[data-theme="dark"] .form-input');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await page.locator('#contact').scrollIntoViewIfNeeded();

  const intentMinHeight = await page.locator('.intent-option').first().evaluate((element) =>
    Number.parseFloat(window.getComputedStyle(element).minHeight)
  );
  const textareaMinHeight = await page.locator('.form-textarea').evaluate((element) =>
    Number.parseFloat(window.getComputedStyle(element).minHeight)
  );
  const statusDisplay = await page.locator('#form-status').evaluate((element) =>
    window.getComputedStyle(element).display
  );
  const submitBox = await page.locator('#form-submit').boundingBox();
  const whatsappBox = await page.locator('.contact-direct-link').boundingBox();

  expect(intentMinHeight).toBeLessThanOrEqual(54);
  expect(textareaMinHeight).toBeLessThanOrEqual(104);
  expect(statusDisplay).toBe('none');
  expect(submitBox.height).toBeGreaterThanOrEqual(44);
  expect(whatsappBox.height).toBeGreaterThanOrEqual(44);
  expect(submitBox.width).toBeGreaterThanOrEqual(300);
  expect(whatsappBox.width).toBeGreaterThanOrEqual(300);
  expect(Math.abs(submitBox.width - whatsappBox.width)).toBeLessThanOrEqual(4);
  expect(whatsappBox.y - (submitBox.y + submitBox.height)).toBeLessThanOrEqual(24);
});

test('capabilities section is tool first and market aligned', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));

  const skills = page.locator('#skills');
  await expect(skills).toContainText('Business Intelligence & Dashboards');
  await expect(skills).toContainText('Data Analysis');
  await expect(skills).toContainText('Business Workflows');
  await expect(skills).toContainText('Databases & Data Handling');
  await expect(skills).toContainText('Web & Product Build');

  for (const tool of [
    'Power BI',
    'DAX',
    'Power Query',
    'Tableau',
    'Looker Studio',
    'SQL',
    'Python',
    'Pandas',
    'NumPy',
    'Jupyter Notebook',
    'Power Automate',
    'Airtable',
    'PostgreSQL',
    'BigQuery',
    'React',
    'Tailwind CSS',
    'Vercel',
  ]) {
    await expect(skills).toContainText(tool);
  }

  const skillsText = await skills.innerText();
  expect(skillsText).not.toContain('Dashboard Design');
  expect(skillsText).not.toContain('Decision Views');
  expect(skillsText).not.toContain('Metric Logic');
  expect(skillsText).not.toContain('Information Structure');
  expect(skillsText).not.toContain('CORE STACK');

  const css = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  expect(css).not.toContain('skill-group--primary::after');
});

test('about section keeps photo with intro and removes metric strip', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));

  const about = page.locator('#about');
  await expect(about.locator('.proof-strip')).toHaveCount(0);
  await expect(about.locator('.about-photo-mobile')).toHaveCount(0);
  await expect(about.locator('.about-photo--desktop img[alt="Arabinda Saha"]')).toBeVisible();
  await expect(about.locator('.about-photo--mobile img[alt="Arabinda Saha"]')).toHaveCount(1);
  await expect(about.locator('.about-photo--desktop img[alt="Arabinda Saha"]')).toHaveAttribute('src', 'assets/profile-540.webp');
  await expect(about.locator('.about-photo--desktop img[alt="Arabinda Saha"]')).toHaveAttribute('srcset', /profile-1080\.webp/);
  await expect(about).toContainText('My Philosophy');
  await expect(about).toContainText('The problem');
  await expect(about).toContainText('The method');
  await expect(about).toContainText('The result');
  await expect(about).toContainText('I work across business intelligence, operational analytics, and web/product builds.');
  await expect(about).toContainText('business intelligence systems, dashboards, and trackers');
  await expect(about).toContainText('6th-year diploma in Fine Arts.');

  const aboutText = await about.innerText();
  expect(aboutText).not.toContain('600+ schools reached');
  expect(aboutText).not.toContain('1,500+ students covered');
  expect(aboutText).not.toContain('60+ teachers coordinated');
  expect(aboutText).not.toContain('~1,000 students in assessment analytics');
  expect(aboutText).not.toContain('Python Pandas · Plotly · Excel · Sheets · SQL');

  const desktopOrder = await about.evaluate((section) => {
    const text = section.innerText;
    return {
      aboutContext: text.indexOf('I work across business intelligence, operational analytics, and web/product builds.'),
      philosophy: text.indexOf('Make the work easier to see.'),
    };
  });
  expect(desktopOrder.aboutContext).toBeGreaterThanOrEqual(0);
  expect(desktopOrder.philosophy).toBeGreaterThan(desktopOrder.aboutContext);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
  await expect(page.locator('#about .about-photo--mobile img[alt="Arabinda Saha"]')).toBeVisible();
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
  await expect(page).toHaveTitle('Arabinda Saha — Business Intelligence & Interface Architect');
  const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
  expect(metaDescription).toMatch(/Business Intelligence & Interface Architect/);
  expect(metaDescription).toMatch(/India/);
  expect(metaDescription).toMatch(/dashboard workflows/);
  expect(metaDescription).toMatch(/data models/);
  expect(metaDescription).toMatch(/dashboards/);
  expect(metaDescription).toMatch(/education analytics/);
  expect(metaDescription).toMatch(/web\/product showcases/);
  expect(metaDescription.length).toBeGreaterThanOrEqual(140);
  expect(metaDescription.length).toBeLessThanOrEqual(165);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'site.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', 'assets/apple-touch-icon.png');
  await expect(page.locator('link[rel="preload"][as="style"][href*="fontshare"]')).toHaveCount(0);
  await expect(page.locator('link[rel="preload"][as="style"][href*="fonts.googleapis"]')).toHaveCount(0);
  await expect(page.locator('link[media="print"][onload*="this.media"]')).toHaveCount(2);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://arabinda07.github.io/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://arabinda07.github.io/assets/og-image.jpg');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /Arabinda Saha portfolio preview/);
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /user-provided illustrated portrait artwork/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://arabinda07.github.io/assets/twitter-image.jpg');
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', /Arabinda Saha portfolio preview/);
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', /user-provided illustrated portrait artwork/);
  await expect(page.locator('meta[property="og:image:alt"]')).not.toHaveAttribute('content', /AS monogram|BI & Data Analyst|decision-lattice/i);
  await expect(page.locator('meta[name="twitter:image:alt"]')).not.toHaveAttribute('content', /AS monogram|BI & Data Analyst|decision-lattice/i);
  await expect(page.locator('meta[property="og:image:alt"]')).not.toHaveAttribute('content', /business intelligence focus|data systems/i);
  await expect(page.locator('meta[name="twitter:image:alt"]')).not.toHaveAttribute('content', /business intelligence focus|data systems/i);
  await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute('content', /data systems/i);
  await expect(page.locator('meta[name="twitter:description"]')).not.toHaveAttribute('content', /data systems/i);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /program operations/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /selected web\/product showcases/);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /program operations/);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /selected web\/product showcases/);

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.length).toBeGreaterThan(0);
  const graph = JSON.parse(jsonLd.join('\n'));
  expect(graph['@context']).toBe('https://schema.org');
  const person = graph['@graph'].find((item) => item['@type'] === 'Person' && item.name === 'Arabinda Saha');
  expect(person).toBeTruthy();
  expect(person.jobTitle).toBe('Business Intelligence & Interface Architect');
  expect(person.description).toContain('Business Intelligence and Interface Architect in India');
  expect(person.alumniOf).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: 'Jadavpur University' }),
  ]));
  expect(person.hasOccupation).toEqual(expect.objectContaining({
    name: 'Business Intelligence & Interface Architect',
  }));
  expect(person.image).toBe('https://arabinda07.github.io/assets/Profile%20picture.png');
  expect(person.knowsAbout).toEqual(expect.arrayContaining(['Plotly', 'Google Sheets', 'Dashboard workflows', 'Business intelligence consulting', 'Tableau', 'Power Query', 'React']));
  expect(graph['@graph'].some((item) => item['@type'] === 'WebSite' && item.url === 'https://arabinda07.github.io/')).toBe(true);
  expect(graph['@graph'].some((item) => item['@type'] === 'ProfilePage' && item.mainEntity && item.mainEntity['@id'] === 'https://arabinda07.github.io/#person')).toBe(true);
  const workExamples = graph['@graph'].find((item) => item['@type'] === 'ItemList' && item.name === 'Selected work examples');
  expect(workExamples).toBeTruthy();
  expect(workExamples.itemListElement.map((item) => item.name)).toEqual(expect.arrayContaining([
    'Competitive Edge - Diagnostic Assessment Analytics',
    'LKS Internal Performance Dashboard Work',
    'Career Assessment Tool',
    'Stellar Space Quiz',
    'School Programs, STEM & LMS Work',
    'School Program Command Centre - Active Prototype',
    'Reflections: Private Writing Journal',
    'Parichay: Private Intro Page Studio',
  ]));
  expect(workExamples.itemListElement.find((item) => item.name === 'School Program Command Centre - Active Prototype').description).toContain('Not yet piloted');
  expect(workExamples.itemListElement.find((item) => item.name === 'Reflections: Private Writing Journal').description).toContain('Live');
  expect(workExamples.itemListElement.find((item) => item.name === 'Parichay: Private Intro Page Studio').description).toContain('Live');
});

test('page exposes one semantic h1 and no blocking loader', async ({ page }) => {
  await page.goto(pageUrl);

  await expect(page.locator('#page-loader')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveClass(/is-loading/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Arabinda Saha');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.hero-name')).toHaveText('Arabinda Saha');
  await expect(page.locator('.hero-name')).toHaveJSProperty('tagName', 'P');
});

test('planned web assets and SEO files exist', async () => {
  const expectedFiles = [
    'favicon.ico',
    'site.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'profile.md',
    'assets/favicon-16x16.png',
    'assets/favicon-32x32.png',
    'assets/favicon-96x96.png',
    'assets/apple-touch-icon.png',
    'assets/android-chrome-192x192.png',
    'assets/android-chrome-512x512.png',
    'assets/brand-source.svg',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_20 PM (1).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_20 PM (2).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_20 PM (3).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_22 PM (4).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_23 PM (5).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_25 PM (6).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_26 PM (7).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_27 PM (8).png',
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_29 PM (9).png',
    'assets/Profile picture.png',
    'assets/profile-540.webp',
    'assets/profile-1080.webp',
    'assets/og-image.png',
    'assets/og-image.jpg',
    'assets/twitter-image.png',
    'assets/twitter-image.jpg',
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
  expect(manifest.description).toContain('Business Intelligence and Interface Architect in India');
  expect(manifest.description).toContain('selected web/product showcases');

  const expectedDimensions = {
    'assets/favicon-16x16.png': [16, 16],
    'assets/favicon-32x32.png': [32, 32],
    'assets/favicon-96x96.png': [96, 96],
    'assets/apple-touch-icon.png': [180, 180],
    'assets/android-chrome-192x192.png': [192, 192],
    'assets/android-chrome-512x512.png': [512, 512],
    'assets/Profile picture.png': [1080, 1080],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_20 PM (1).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_20 PM (2).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_20 PM (3).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_22 PM (4).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_23 PM (5).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_25 PM (6).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_26 PM (7).png': [1254, 1254],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_27 PM (8).png': [1731, 909],
    'assets/photos/ChatGPT Image May 31, 2026, 12_53_29 PM (9).png': [1734, 907],
    'assets/og-image.png': [1200, 630],
    'assets/twitter-image.png': [1200, 675],
  };

  for (const [file, [width, height]] of Object.entries(expectedDimensions)) {
    expect(readPngSize(path.join(rootDir, file))).toEqual({ width, height });
  }

  expect(readPngColorType(path.join(rootDir, 'assets/Profile picture.png'))).toBe(6);
  expect(readWebpSize(path.join(rootDir, 'assets/profile-540.webp'))).toEqual({ width: 540, height: 540 });
  expect(readWebpSize(path.join(rootDir, 'assets/profile-1080.webp'))).toEqual({ width: 1080, height: 1080 });
  expect(readJpegSize(path.join(rootDir, 'assets/og-image.jpg'))).toEqual({ width: 1200, height: 630 });
  expect(readJpegSize(path.join(rootDir, 'assets/twitter-image.jpg'))).toEqual({ width: 1200, height: 675 });
  expect(fs.statSync(path.join(rootDir, 'assets/profile-540.webp')).size).toBeLessThan(40 * 1024);
  expect(fs.statSync(path.join(rootDir, 'assets/profile-1080.webp')).size).toBeLessThan(90 * 1024);
  expect(fs.statSync(path.join(rootDir, 'assets/og-image.jpg')).size).toBeLessThan(140 * 1024);
  expect(fs.statSync(path.join(rootDir, 'assets/twitter-image.jpg')).size).toBeLessThan(140 * 1024);
});

test('rendered images load successfully', async ({ page }) => {
  await page.goto(pageUrl);
  await page.waitForLoadState('load');

  const failedImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => image.currentSrc && (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0))
      .map((image) => image.currentSrc)
  );

  expect(failedImages).toEqual([]);
});

test('web assets retire the old AS monogram language', async () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const brandSource = fs.readFileSync(path.join(rootDir, 'assets', 'brand-source.svg'), 'utf8');

  expect(html).not.toMatch(/AS monogram|BI & Data Analyst|decision-lattice/i);
  expect(brandSource).not.toMatch(/>AS<|AS monogram|BI & Data Analyst|decision-lattice/i);
});

test('published work assets only include optimized webp images', async () => {
  const workRoot = path.join(rootDir, 'assets', 'work photos');
  const files = [];

  function collectFiles(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        collectFiles(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  collectFiles(workRoot);
  expect(files.length).toBeGreaterThan(0);

  const unoptimizedFiles = files
    .filter((file) => !file.includes(`${path.sep}optimized${path.sep}`) || path.extname(file).toLowerCase() !== '.webp')
    .map((file) => path.relative(rootDir, file));

  expect(unoptimizedFiles).toEqual([]);
});

test('AI-readable and sitemap files match current SEO positioning', async () => {
  const publicContentFiles = [
    'index.html',
    'sitemap.xml',
    'sitemap.xsl',
    'llms.txt',
    'profile.md',
    'PRODUCT.md',
    'DESIGN.md',
    'README.md',
    'site.webmanifest',
    'robots.txt',
  ];
  for (const file of publicContentFiles) {
    const fileText = fs.readFileSync(path.join(rootDir, file), 'utf8');
    expect(fileText, `${file} should not use the stale sitemap title`).not.toContain('Data Systems Consultant');
  }

  const llmsText = fs.readFileSync(path.join(rootDir, 'llms.txt'), 'utf8');
  expect(llmsText).toContain('Business Intelligence & Interface Architect');
  expect(llmsText).toContain('Best-fit opportunities');
  expect(llmsText).toContain('Who Arabinda Saha is');
  expect(llmsText).toContain('Verified proof');
  expect(llmsText).toContain('Core skills and tools');
  expect(llmsText).toContain('Business Intelligence Consultant');
  expect(llmsText).toContain('Interface Architect');
  expect(llmsText).toContain('Kolkata, Bengaluru, Hyderabad, Gurugram, Pune, Mumbai, and remote India');
  expect(llmsText).toContain('LKS Internal Performance Dashboard Work');
  expect(llmsText).toContain('Selected web and product showcases');
  expect(llmsText).toContain('School Program Command Centre - Active Prototype');
  expect(llmsText).toContain('Reflections: Private Writing Journal');
  expect(llmsText).toContain('Parichay: Private Intro Page Studio');
  expect(llmsText).toContain('Interpretation guardrails');
  expect(llmsText).toContain('primary proof layer');
  expect(llmsText).toContain('not yet piloted');
  expect(llmsText).toContain('Fine Arts');
  expect(llmsText).not.toContain('LKS Internal Dashboard Work - Confidential / Anonymized');
  expect(llmsText).not.toContain('LKS Internal Dashboard Work — Confidential / Anonymized');
  expect(llmsText).not.toContain('Product Operations & Data Consultant');
  expect(llmsText).not.toContain('Target-stack positioning');

  const profileText = fs.readFileSync(path.join(rootDir, 'profile.md'), 'utf8');
  expect(profileText).toContain('What does Arabinda Saha do?');
  expect(profileText).toContain('Business Intelligence & Interface Architect');
  expect(profileText).toContain('Interface Architect');
  expect(profileText).toContain('Tableau');
  expect(profileText).toContain('Power Query');
  expect(profileText).toContain('Dashboard Analyst');
  expect(profileText).toContain('verified proof');
  expect(profileText).toContain('Bloom');
  expect(profileText).toContain('What selected web and product showcases are public?');
  expect(profileText).toContain('School Program Command Centre');
  expect(profileText).toContain('Reflections');
  expect(profileText).toContain('Parichay');
  expect(profileText).toContain('primary proof layer');
  expect(profileText).not.toContain('reducing cloud infrastructure compute overhead by an estimated 20%');
  expect(profileText).not.toContain('Eliminated reporting discrepancies across business units');

  const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
  const sitemapXsl = fs.readFileSync(path.join(rootDir, 'sitemap.xsl'), 'utf8');
  expect(sitemap).toContain('<lastmod>2026-05-31</lastmod>');
  expect(sitemap).not.toContain('<lastmod>2026-05-24</lastmod>');
  expect((sitemap.match(/<url>/g) || []).length).toBe(3);
  expect(sitemap).toContain('<loc>https://arabinda07.github.io/</loc>');
  expect(sitemap).toContain('<loc>https://arabinda07.github.io/llms.txt</loc>');
  expect(sitemap).toContain('<loc>https://arabinda07.github.io/profile.md</loc>');
  expect(sitemap).not.toContain('project-t2dax.vercel.app');
  expect(sitemap).not.toContain('reflections-sanctuary.space');
  expect(sitemap).not.toContain('parichay-your-story.vercel.app');
  expect(sitemapXsl).toContain('Arabinda Saha — Business Intelligence &amp; Interface Architect');
  expect(sitemapXsl).not.toContain('Data Systems Consultant');
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
  expect(designDoc).toContain('Optimized real/photo evidence galleries');
  expect(designDoc).toContain('restrained text-only cards');

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

test('product context document exists for design work', async () => {
  const productPath = path.join(rootDir, 'PRODUCT.md');
  expect(fs.existsSync(productPath), 'PRODUCT.md should exist').toBe(true);

  const productDoc = fs.readFileSync(productPath, 'utf8');
  expect(productDoc).toContain('register: brand');
  expect(productDoc).toContain('## Users');
  expect(productDoc).toContain('## Product Purpose');
  expect(productDoc).toContain('## Machine-Readable SEO Policy');
  expect(productDoc).toContain('## Brand Personality');
  expect(productDoc).toContain('## Anti-References');
  expect(productDoc).toContain('verified business intelligence');
  expect(productDoc).toContain('marked by status');
  expect(productDoc).toContain('Reflections and Parichay');
  expect(productDoc).not.toMatch(/freelance/i);
});

for (const viewport of [
  { name: 'small mobile', width: 320, height: 740 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 900, height: 1100 },
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

test('experience tabs stay inside the narrowest supported mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(pageUrl);
  await page.locator('#experience').scrollIntoViewIfNeeded();

  const overflow = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.tab-btn'))
      .filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
      })
      .map((button) => button.textContent.trim());
  });

  expect(overflow).toEqual([]);
});

test('featured work media layout adapts from desktop evidence cards to mobile stack', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto(pageUrl);
  await page.locator('#work').scrollIntoViewIfNeeded();

  const desktopLayout = await page.locator('.featured-project').filter({ has: page.locator('.fp-image') }).first().evaluate((project) => {
    const artifact = project.querySelector('.fp-image').getBoundingClientRect();
    const content = project.querySelector('.fp-content').getBoundingClientRect();
    const desc = project.querySelector('.fp-desc-box').getBoundingClientRect();
    const tags = project.querySelector('.fp-tech').getBoundingClientRect();
    return {
      artifactBeforeContent: artifact.bottom <= content.top + 2,
      mediaNearlyFullWidth: artifact.width >= content.width - 2,
      structuredContent: tags.left >= desc.right - 2,
      artifactWidth: artifact.width,
      contentWidth: content.width,
    };
  });

  expect(desktopLayout.artifactBeforeContent).toBe(true);
  expect(desktopLayout.mediaNearlyFullWidth).toBe(true);
  expect(desktopLayout.structuredContent).toBe(true);
  expect(desktopLayout.artifactWidth).toBeGreaterThan(800);

  await page.setViewportSize({ width: 900, height: 1100 });
  await page.goto(pageUrl);
  await page.locator('#work').scrollIntoViewIfNeeded();

  const tabletLayout = await page.locator('.featured-project').filter({ has: page.locator('.fp-image') }).first().evaluate((project) => {
    const artifact = project.querySelector('.fp-image').getBoundingClientRect();
    const content = project.querySelector('.fp-content').getBoundingClientRect();
    return {
      artifactBeforeContent: artifact.bottom <= content.top + 2,
      nearlyFullWidth: artifact.width >= content.width - 2,
      artifactWidth: artifact.width,
      contentWidth: content.width,
    };
  });

  expect(tabletLayout.artifactBeforeContent).toBe(true);
  expect(tabletLayout.nearlyFullWidth).toBe(true);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(pageUrl);
    await page.locator('#work').scrollIntoViewIfNeeded();

    const stacked = await page.locator('.featured-project').filter({ has: page.locator('.fp-image') }).first().evaluate((project) => {
      const artifact = project.querySelector('.fp-image').getBoundingClientRect();
      const content = project.querySelector('.fp-content').getBoundingClientRect();
      return {
        artifactBeforeContent: artifact.bottom <= content.top + 2,
        nearlyFullWidth: artifact.width >= content.width - 2,
      };
    });

    expect(stacked.artifactBeforeContent).toBe(true);
    expect(stacked.nearlyFullWidth).toBe(true);
  }
});

test('proof artifact internals stay inside their containers', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 900, height: 1100 },
    { width: 1440, height: 980 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(pageUrl);
    await page.locator('#work').scrollIntoViewIfNeeded();

    const overflow = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.proof-artifact')).flatMap((artifact) => {
        const parent = artifact.getBoundingClientRect();
        return Array.from(artifact.querySelectorAll('.artifact-bar span, .artifact-grid span, .artifact-flow span, .artifact-panel, p'))
          .filter((child) => {
            const rect = child.getBoundingClientRect();
            return rect.left < parent.left - 1 ||
              rect.right > parent.right + 1 ||
              rect.top < parent.top - 1 ||
              rect.bottom > parent.bottom + 1;
          })
          .map((child) => child.textContent.trim());
      });
    });

    expect(overflow).toEqual([]);
  }
});
