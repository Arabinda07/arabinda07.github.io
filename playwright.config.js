// @ts-check
const fs = require('fs');
const { defineConfig } = require('@playwright/test');

const localChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const launchOptions = fs.existsSync(localChromePath)
  ? { executablePath: localChromePath }
  : undefined;

module.exports = defineConfig({
  testDir: './tests',
  use: {
    headless: true,
    launchOptions,
  }
});
