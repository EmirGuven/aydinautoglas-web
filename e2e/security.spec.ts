import { test, expect } from '@playwright/test'
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from './global-setup'

// Pure API-level checks — viewport doesn't matter, and running them twice (once per
// Playwright project) only doubles pressure on the shared in-memory rate limiter that other
// spec files' /api/contact calls also share. Restricted to the `chromium` project via
// playwright.config.ts's per-project `testIgnore`.
test.describe('security', () => {
  test('a filled honeypot gets an identical success response, not a rejection', async ({ request }) => {
    const real = await request.post('/api/contact', {
      data: { name: 'Real Visitor', email: `real-${Date.now()}@example.com`, message: 'A real message.', locale: 'de' },
    })
    const bot = await request.post('/api/contact', {
      data: {
        name: 'Bot',
        email: `bot-${Date.now()}@example.com`,
        message: 'Spam',
        locale: 'de',
        companyWebsite: 'http://spam.example',
      },
    })
    expect(real.status()).toBe(200)
    expect(bot.status()).toBe(200)
    expect(await real.json()).toEqual(await bot.json())
  })

  test('the appointment rate limiter blocks after repeated submissions', async ({ request }) => {
    // Uses /api/appointments (its own rate-limit bucket, checkRateLimit(event, 'appointment', 5, 60_000))
    // rather than /api/contact, so exhausting it doesn't 429 the other tests/spec files that
    // submit the contact form — they share a server but not this scope's bucket.
    const submit = () =>
      request.post('/api/appointments', {
        data: { contactName: 'Rate Test', contactEmail: `rate-${Math.random()}@example.com`, locale: 'de', consent: true },
      })
    const responses = []
    for (let i = 0; i < 8; i++) {
      responses.push(await submit())
    }
    expect(responses.some((r) => r.status() === 429)).toBe(true)
  })

  test('uploading a non-image file disguised with an image extension is rejected', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('E-Mail', { exact: true }).fill(E2E_ADMIN_EMAIL)
    await page.getByLabel('Passwort', { exact: true }).fill(E2E_ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Anmelden' }).click()
    await expect(page).toHaveURL(/\/admin$/)

    const response = await page.request.post('/api/admin/media', {
      multipart: {
        file: {
          name: 'not-really-an-image.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('#!/bin/sh\necho "this is a script, not a jpeg"\n'),
        },
      },
    })
    expect(response.status()).toBe(422)
  })
})
