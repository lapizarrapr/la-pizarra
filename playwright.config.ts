import { defineConfig, devices } from '@playwright/test'

import 'dotenv/config'

/**
 * End-to-end tests run against a running site with the sample content
 * loaded (`pnpm db:up && pnpm seed`).
 *
 * By default Playwright starts (or reuses) the dev server on port 3000.
 * Set E2E_BASE_URL to test another instance, e.g. a production build.
 */
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The tests share one database, so they run one at a time.
  workers: 1,
  fullyParallel: false,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  use: {
    baseURL,
    locale: 'es-PR',
    timezoneId: 'America/Puerto_Rico',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        reuseExistingServer: true,
        url: baseURL,
        timeout: 180_000,
      },
})
