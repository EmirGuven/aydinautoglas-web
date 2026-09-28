import { test, expect } from '@playwright/test'
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from './global-setup'

test('a DB translation override is reflected on the public site without a deploy', async ({ page }) => {
  test.setTimeout(90_000) // polls through a 60s server-side cache TTL — see below
  const marker = `E2E-OVERRIDE-${Date.now()}`

  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail', { exact: true }).fill(E2E_ADMIN_EMAIL)
  await page.getByLabel('Passwort', { exact: true }).fill(E2E_ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await expect(page).toHaveURL(/\/admin$/)

  // Read the key's current values first (PUT replaces the whole values object) so this
  // test doesn't clobber the other languages — same pattern the admin UI's own edit form uses.
  const before = await page.request.get('/api/admin/translations').then((r) => r.json())
  const row = before.find((t: { key: string }) => t.key === 'contactForm.send')
  const putResponse = await page.request.put('/api/admin/translations/contactForm.send', {
    data: { group: 'contactForm', values: { ...row.values, de: marker } },
  })
  expect(putResponse.status()).toBe(200)

  try {
    // Public endpoint + merge into vue-i18n are both cached for up to 60s (server/services/translations.service.ts,
    // server/api/translations.get.ts) — poll instead of a fixed sleep.
    await expect(async () => {
      const map = await page.request.get('/api/translations').then((r) => r.json())
      expect(map['contactForm.send']?.de).toBe(marker)
    }).toPass({ timeout: 70_000, intervals: [2000] })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: marker })).toBeVisible()
  } finally {
    // Restore the original value so this test is repeatable and doesn't leave the seeded
    // German "Senden" button text permanently changed.
    await page.request.put('/api/admin/translations/contactForm.send', { data: { group: 'contactForm', values: row.values } })
  }
})
