// @ts-check
const fs = require('fs');
const { defineConfig } = require('@playwright/test');

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];
const chromePath = chromeCandidates.find((p) => fs.existsSync(p));
const launchOptions = chromePath
  ? { executablePath: chromePath }
  : undefined;

module.exports = defineConfig({
  testDir: './tests',
  use: {
    headless: true,
    launchOptions,
  }
});
