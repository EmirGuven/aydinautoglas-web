import { getSetting } from '../services/site-settings.service'
import {
  listServicesForBlock,
  listLocationsForBlock,
  listFaqsForBlock,
  listPublishedBlogPostsForBlock,
} from '../services/content-read.service'
import { getDefaultLocaleCode, withLocalePrefix } from '../utils/locale-paths'
import { pickTranslatedServer } from '../utils/i18n'

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Extended llms-full.txt: same as llms.txt plus service descriptions, FAQs and recent blog posts. */
export default defineCachedEventHandler(
  async (event) => {
    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const defaultCode = await getDefaultLocaleCode()
    const query = getQuery(event)
    const locale = typeof query.locale === 'string' ? query.locale : defaultCode

    const [general, contact, services, locations, faqs, posts] = await Promise.all([
      getSetting('general'),
      getSetting('contact'),
      listServicesForBlock(50, false),
      listLocationsForBlock(),
      listFaqsForBlock(),
      listPublishedBlogPostsForBlock(locale, 20),
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
      ...services.flatMap((s) => [
        `### ${pickTranslatedServer(s.title, locale)}`,
        `${origin}${withLocalePrefix(`/services/${s.slug[locale] ?? s.slug[defaultCode]}`, locale, defaultCode)}`,
        stripHtml(pickTranslatedServer(s.shortDescription, locale)),
        '',
      ]),
      '## Branches',
      ...locations.flatMap((l) => [
        `### ${pickTranslatedServer(l.name, locale)}`,
        `${origin}${withLocalePrefix(`/branches/${l.slug[locale] ?? l.slug[defaultCode]}`, locale, defaultCode)}`,
        pickTranslatedServer(l.address, locale),
        l.phone ? `Phone: ${l.phone}` : '',
        '',
      ]),
      '## FAQ',
      ...faqs.flatMap((f) => [`Q: ${pickTranslatedServer(f.question, locale)}`, `A: ${pickTranslatedServer(f.answer, locale)}`, '']),
      '## Recent blog posts',
      ...posts.map((p) => `- ${pickTranslatedServer(p.title, locale)}: ${origin}${withLocalePrefix(`/blog/${p.slug[locale] ?? p.slug[defaultCode]}`, locale, defaultCode)}`),
    ].filter((line) => line !== '')

    setHeader(event, 'content-type', 'text/plain; charset=utf-8')
    return lines.join('\n') + '\n'
  },
  { maxAge: 300 },
)
