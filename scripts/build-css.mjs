// Rebuild styles.css from styles.src.css.
// Output format matches the original styles.css the smoke tests assert against:
// - quoted attribute selectors (html[data-theme="dark"])  -> lightningcss minify:false
// - decimal oklch lightness (oklch(0.535 ...))            -> post-pass below
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { transform } = require('lightningcss');

const src = path.join(rootDir, 'styles.src.css');
const out = path.join(rootDir, 'styles.css');

const result = transform({
  filename: src,
  code: fs.readFileSync(src),
  minify: false,
});

let css = result.code.toString();

// lightningcss normalizes oklch lightness to percentages (53.5% -> 0.535).
// The smoke tests parse oklch colors expecting decimal lightness, so convert back.
css = css.replace(/oklch\((\d+(?:\.\d+)?)%/g, (_m, lightness) => `oklch(${Number(lightness) / 100}`);

fs.writeFileSync(out, css);
console.log(`styles.css rebuilt: ${css.length} bytes`);
