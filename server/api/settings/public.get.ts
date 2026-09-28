import { getSetting } from '../../services/site-settings.service'

/** Public: settings needed to render the header/footer/mobile CTA bar and the cookie/analytics gate. */
export default defineEventHandler(async () => {
  const [general, logo, contact, social, cookieBanner, analytics] = await Promise.all([
    getSetting('general'),
    getSetting('logo'),
    getSetting('contact'),
    getSetting('social'),
    getSetting('cookieBanner'),
    getSetting('analytics'),
  ])
  return { general, logo, contact, social, cookieBanner, analytics }
})
