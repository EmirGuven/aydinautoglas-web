import { getSetting } from '../services/site-settings.service'
import { listServicesForBlock, listLocationsForBlock } from '../services/content-read.service'
import { getDefaultLocaleCode, withLocalePrefix } from '../utils/locale-paths'
import { pickTranslatedServer } from '../utils/i18n'

/**
 * A concise llms.txt summary for AI crawlers/answer engines (prompt.md §15.4).
 * `?locale=en` selects the language (default: the site's default locale) — a full per-path
 * localized route (`/en/llms.txt`) would need its own file-based route per locale, which
 * conflicts with `languages` being pure runtime data (ADR-0001), so a query param is used
 * instead; this is documented as a known simplification (see docs/decisions.md ADR-0009).
 */
export default defineCachedEventHandler(
  async (event) => {
    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const defaultCode = await getDefaultLocaleCode()
    const query = getQuery(event)
    const locale = typeof query.locale === 'string' ? query.locale : defaultCode

    const [general, contact, services, locations] = await Promise.all([
      getSetting('general'),
      getSetting('contact'),
      listServicesForBlock(50, false),
      listLocationsForBlock(),
    ])

    const home = withLocalePrefix('/', locale, defaultCode)
    const lines = [
      `# ${general?.companyName ?? 'Company'}`,
      '',
      pickTranslatedServer(contact?.address, locale) || '',
      contact?.phone ? `Phone: ${contact.phone}` : '',
      contact?.email ? `Email: ${contact.email}` : '',
      `Website: ${origin}${home}`,
      '',
      '## Services',
      ...services.map((s) => `- ${pickTranslatedServer(s.title, locale)}: ${origin}${withLocalePrefix(`/services/${s.slug[locale] ?? s.slug[defaultCode]}`, locale, defaultCode)}`),
      '',
      '## Branches',
      ...locations.map((l) => `- ${pickTranslatedServer(l.name, locale)}: ${origin}${withLocalePrefix(`/branches/${l.slug[locale] ?? l.slug[defaultCode]}`, locale, defaultCode)}`),
    ].filter((line) => line !== '')

    setHeader(event, 'content-type', 'text/plain; charset=utf-8')
    return lines.join('\n') + '\n'
  },
  { maxAge: 300 },
)
