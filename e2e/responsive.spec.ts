import { test, expect } from '@playwright/test'

/** Runs on every project, but only meaningful on the 360px `mobile-360` project (see playwright.config.ts). */
test.describe('360px responsive layout', () => {
  const pages = ['/', '/services', '/branches', '/blog', '/appointment', '/admin/login']

  for (const path of pages) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path)
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // 1px rounding tolerance
    })
  }
})
