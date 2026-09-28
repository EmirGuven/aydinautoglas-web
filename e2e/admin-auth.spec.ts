import { test, expect } from '@playwright/test'
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from './global-setup'

test('admin can log in, see the dashboard, and log out', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
  // Wait for Nuxt hydration before interacting — clicking before the client JS attaches its
  // @submit.prevent handler falls through to a native (non-JS) form submit that reloads the
  // page instead of calling the API, which looks like "the click did nothing" from here.
  await page.waitForLoadState('networkidle')

  // The login page has no logged-in user yet, so it always shows German (the admin i18n
  // fallback locale — see app/composables/useAdminI18n.ts) regardless of the account's own
  // saved panel-language preference, which only takes effect once `user` is populated.
  await page.getByLabel('E-Mail', { exact: true }).fill(E2E_ADMIN_EMAIL)
  await page.getByLabel('Passwort', { exact: true }).fill(E2E_ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Anmelden' }).click()

  await expect(page).toHaveURL(/\/admin$/)

  await page.getByRole('button', { name: 'Account menu for E2E Admin' }).click()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('/api/admin/** rejects requests without a session', async ({ request }) => {
  const response = await request.get('/api/admin/services')
  expect(response.status()).toBe(401)
})
