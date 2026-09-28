import { getSetting } from '../../services/site-settings.service'
import { getMediaByIds } from '../../services/media-read.service'

/** Public: Organization + WebSite JSON-LD shared across every public page (prompt.md §15.2). */
export default defineCachedEventHandler(
  async (event) => {
    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const [general, logo, social, contact] = await Promise.all([
      getSetting('general'),
      getSetting('logo'),
      getSetting('social'),
      getSetting('contact'),
    ])

    const logoMedia = logo?.logoMediaId ? (await getMediaByIds([logo.logoMediaId]))[0] : undefined
    const logoUrl = logoMedia ? `${origin}${Object.values(logoMedia.sizes)[0]}` : undefined

    const sameAs = [social?.facebook, social?.instagram, social?.linkedin].filter((url): url is string => !!url)

    const organization: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: general?.companyName,
      url: origin,
      ...(logoUrl ? { logo: logoUrl } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      ...(contact?.email ? { email: contact.email } : {}),
      ...(contact?.phone ? { telephone: contact.phone } : {}),
    }

    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: general?.companyName,
      url: origin,
    }

    return [organization, website]
  },
  { maxAge: 300 },
)
