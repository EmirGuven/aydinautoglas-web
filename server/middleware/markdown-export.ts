import { getServiceBySlug } from '../services/services.service'
import { getPublishedBlogPostBySlug } from '../services/blog.service'
import { getPublishedPageBySlug } from '../services/pages.service'
import { getSetting } from '../services/site-settings.service'
import { resolveLocaleFromPath } from '../utils/locale-paths'
import { pickTranslatedServer } from '../utils/i18n'
import { htmlToMarkdown } from '../utils/html-to-markdown'

/**
 * Optional clean-Markdown export of any public page/service/blog-post, served via content
 * negotiation (`Accept: text/markdown`) rather than a separate `.md` route, so it never
 * shadows the normal HTML page at the same URL (prompt.md §15.4). Admin-togglable via
 * Settings → SEO defaults (`site_settings.seoDefaults.markdownExportEnabled`).
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return
  const accept = getHeader(event, 'accept') ?? ''
  if (!accept.includes('text/markdown')) return

  const rawPath = event.path.split('?')[0] ?? event.path
  if (rawPath.startsWith('/api/') || rawPath.startsWith('/admin') || rawPath.startsWith('/_nuxt/') || rawPath.startsWith('/uploads/')) return

  const seoDefaults = await getSetting('seoDefaults')
  if (seoDefaults?.markdownExportEnabled === false) return

  const { locale, rest } = await resolveLocaleFromPath(rawPath)

  const serviceMatch = rest.match(/^\/services\/([^/]+)\/?$/)
  const blogMatch = rest.match(/^\/blog\/([^/]+)\/?$/)

  let markdown: string | undefined

  if (serviceMatch?.[1]) {
    const service = await getServiceBySlug(locale, serviceMatch[1])
    if (service) {
      const title = pickTranslatedServer(service.title, locale)
      markdown = `# ${title}\n\n${htmlToMarkdown(pickTranslatedServer(service.content, locale))}`
    }
  } else if (blogMatch?.[1]) {
    const post = await getPublishedBlogPostBySlug(locale, blogMatch[1])
    if (post) {
      const title = pickTranslatedServer(post.title, locale)
      markdown = `# ${title}\n\n${htmlToMarkdown(pickTranslatedServer(post.content, locale))}`
    }
  } else {
    const slug = rest.replace(/^\//, '')
    const result = await getPublishedPageBySlug(locale, slug)
    if (result) {
      const title = pickTranslatedServer(result.page.title, locale)
      const sections = result.blocks
        .map((block) => {
          const data = block.data as Record<string, unknown>
          const heading = pickTranslatedServer(data.heading as Record<string, string> | undefined, locale)
          const content = htmlToMarkdown(
            pickTranslatedServer((data.content ?? data.text) as Record<string, string> | undefined, locale),
          )
          return [heading ? `## ${heading}` : '', content].filter(Boolean).join('\n\n')
        })
        .filter(Boolean)
      markdown = [`# ${title}`, ...sections].join('\n\n')
    }
  }

  if (markdown === undefined) return

  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return markdown
})
