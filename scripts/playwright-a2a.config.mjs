// Minimal Playwright config for A2A/Descript browser sessions
// Bypasses webServer requirement of the main playwright.config.js
export default {
  testDir: '.',
  testMatch: ['scripts/*.spec.mjs'],
  timeout: 300_000,
  use: {
    headless: false,
    viewport: { width: 1440, height: 900 },
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [['line'], ['json', { outputFile: 'beads/checkpoints/playwright-results.json' }]],
};
