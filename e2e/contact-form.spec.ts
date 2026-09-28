import { test, expect } from '@playwright/test'

test('contact form submits successfully', async ({ page }) => {
  // Default locale is German — the form's labels are German (see i18n/locales/de.json).
  await page.goto('/')
  // Wait for hydration — see the comment in admin-auth.spec.ts for why this matters.
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Name', { exact: true }).fill('Playwright Test')
  await page.getByLabel('E-Mail', { exact: true }).fill(`playwright-${Date.now()}@example.com`)
  await page.getByLabel('Nachricht', { exact: true }).fill('This is an automated end-to-end test submission.')
  await page.getByRole('button', { name: 'Senden' }).click()
  await expect(page.getByText('Vielen Dank, wir melden uns in Kürze.')).toBeVisible()
})
