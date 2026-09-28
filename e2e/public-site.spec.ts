import { test, expect } from '@playwright/test'

/**
 * Assumes the app is running against a database seeded with the `autoglass` template
 * (`pnpm db:seed --template=autoglass`) — these assertions match that template's content.
 */
test.describe('public site', () => {
  test('homepage renders hero, services and JSON-LD', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ihr Spezialist für Autoglas' })).toBeVisible()
    await expect(page.getByText('Steinschlagreparatur').first()).toBeVisible()

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.some((json) => json.includes('"@type":"Organization"'))).toBe(true)
  })

  test('language switcher navigates to the English homepage', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Language: Deutsch/ }).click()
    await page.getByRole('link', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.getByRole('heading', { name: 'Your Auto Glass Specialist' })).toBeVisible()
  })

  test('services list links to a working detail page', async ({ page }) => {
    await page.goto('/services')
    await page.getByRole('link', { name: /Steinschlagreparatur/ }).click()
    await expect(page).toHaveURL(/\/services\/steinschlagreparatur/)
    await expect(page.getByRole('heading', { name: 'Steinschlagreparatur' })).toBeVisible()
  })

  test('public content is readable with JavaScript disabled (SSR)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ihr Spezialist für Autoglas' })).toBeVisible()
    await expect(page.getByText('Steinschlagreparatur').first()).toBeVisible()
    await context.close()
  })
})
