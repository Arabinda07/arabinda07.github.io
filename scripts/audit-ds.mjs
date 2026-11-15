import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function parseOklch(value) {
  const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/);
  if (!match) throw new Error(`Expected OKLCH color, got: ${value}`);
  return {
    l: Number.parseFloat(match[1]),
    c: Number.parseFloat(match[2]),
    h: Number.parseFloat(match[3]),
  };
}

function oklchToSrgb(value) {
  const { l, c, h } = parseOklch(value);
  const hue = (h * Math.PI) / 180;
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
    channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
  );
}

function srgbToHex(rgb) {
  return (
    '#' +
    rgb
      .map((channel) =>
        Math.round(channel * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function relativeLuminance(rgb) {
  const linear = rgb.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(fg, bg) {
  const fgLum = relativeLuminance(oklchToSrgb(fg));
  const bgLum = relativeLuminance(oklchToSrgb(bg));
  return (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
}

function extractThemeBlock(css, selectorPattern) {
  const match = css.match(new RegExp(`${selectorPattern}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`Missing theme block for ${selectorPattern}`);
  const tokens = {};
  for (const line of match[1].split('\n')) {
    const tokenMatch = line.match(/^\s*(--color-[a-z-]+):\s*(oklch\([^)]+\));/);
    if (tokenMatch) {
      tokens[tokenMatch[1]] = tokenMatch[2];
    }
  }
  return tokens;
}

const cssSrc = fs.readFileSync(path.join(rootDir, 'styles.src.css'), 'utf8');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

const lightTokens = extractThemeBlock(cssSrc, ':root,\\s*html\\[data-theme="light"\\]');
const darkTokens = extractThemeBlock(cssSrc, 'html\\[data-theme="dark"\\]');

const errors = [];

// 1. Validate WCAG contrast in both light and dark modes
const textTokens = ['--color-text-primary', '--color-text-secondary', '--color-text-muted', '--color-accent-strong'];
const surfaceTokens = ['--color-canvas', '--color-surface', '--color-surface-raised'];

for (const [mode, tokens] of [
  ['light', lightTokens],
  ['dark', darkTokens],
]) {
  for (const fg of textTokens) {
    for (const bg of surfaceTokens) {
      const ratio = contrastRatio(tokens[fg], tokens[bg]);
      if (ratio < 4.5) {
        errors.push(`[${mode}] ${fg} on ${bg} is ${ratio.toFixed(2)}:1 (requires >= 4.5:1)`);
      }
    }
  }

  const mediaRatio = contrastRatio(tokens['--color-text-secondary'], tokens['--color-surface-media']);
  if (mediaRatio < 4.5) {
    errors.push(`[${mode}] --color-text-secondary on --color-surface-media is ${mediaRatio.toFixed(2)}:1 (requires >= 4.5:1)`);
  }

  const uiAccentRatio = contrastRatio(tokens['--color-accent'], tokens['--color-canvas']);
  if (uiAccentRatio < 3.0) {
    errors.push(`[${mode}] --color-accent on --color-canvas is ${uiAccentRatio.toFixed(2)}:1 (requires >= 3.0:1)`);
  }
}

// 2. Scan for stray hardcoded hex values outside SVG data URIs and theme-color meta
const cssWithoutSvgData = cssSrc.replace(/url\("data:image\/svg\+xml[^"]*"\)/g, '');
const cssHexes = cssWithoutSvgData.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
if (cssHexes.length) {
  errors.push(`Hardcoded hex colors found in styles.src.css: ${cssHexes.join(', ')}`);
}

const htmlWithoutAllowedHexes = html
  .replace(/<meta\s+name="theme-color"[^>]*>/g, '')
  .replace(/data:image\/svg\+xml[^"']*/g, '');
const htmlHexes = htmlWithoutAllowedHexes.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
if (htmlHexes.length) {
  errors.push(`Hardcoded hex colors found in index.html: ${htmlHexes.join(', ')}`);
}

// 3. Verify theme-color meta hexes match exact sRGB conversions
const expectedLightHex = srgbToHex(oklchToSrgb(lightTokens['--color-canvas-soft']));
const expectedDarkHex = srgbToHex(oklchToSrgb(darkTokens['--color-canvas']));

const themeMetaMatch = html.match(/<meta\s+name="theme-color"[^>]*>/);
if (!themeMetaMatch) {
  errors.push('Missing <meta name="theme-color"> in index.html');
} else {
  const metaTag = themeMetaMatch[0];
  const content = metaTag.match(/content="([^"]+)"/)?.[1]?.toLowerCase();
  const lightAttr = metaTag.match(/data-theme-color-light="([^"]+)"/)?.[1]?.toLowerCase();
  const darkAttr = metaTag.match(/data-theme-color-dark="([^"]+)"/)?.[1]?.toLowerCase();

  if (content !== expectedLightHex) {
    errors.push(`theme-color content="${content}" does not match light --color-canvas-soft sRGB ${expectedLightHex}`);
  }
  if (lightAttr !== expectedLightHex) {
    errors.push(`data-theme-color-light="${lightAttr}" does not match light --color-canvas-soft sRGB ${expectedLightHex}`);
  }
  if (darkAttr !== expectedDarkHex) {
    errors.push(`data-theme-color-dark="${darkAttr}" does not match dark --color-canvas sRGB ${expectedDarkHex}`);
  }
}

if (errors.length) {
  console.error('Design system audit failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

console.log(`Design system audit passed. Light theme-color: ${expectedLightHex}, Dark theme-color: ${expectedDarkHex}`);
