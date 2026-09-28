import { defineConfig, devices } from '@playwright/test'

/**
 * Critical-path E2E tests against a running app (`pnpm dev` + `docker-compose.dev.yml`
 * postgres, seeded with the autoglass template — see docs/how-to for seeding).
 * `pnpm test:e2e` assumes the app is already running at BASE_URL; it does not start one
 * itself, since the app needs a seeded database that a bare `webServer` boot wouldn't have.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // security.spec.ts is pure API-level checks (no viewport dependency) that deliberately
    // trip the shared in-memory rate limiter — running it twice only doubles that pressure
    // against other specs' /api/contact calls for no extra coverage. translations.spec.ts is
    // also viewport-independent and slow (polls through a 60s cache TTL) — no need to double it.
    { name: 'mobile-360', use: { viewport: { width: 360, height: 740 } }, testIgnore: ['**/security.spec.ts', '**/translations.spec.ts'] },
  ],
})
