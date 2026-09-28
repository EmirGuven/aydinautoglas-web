import { listSitemapUrls } from '../services/sitemap.service'
import { getDefaultLocaleCode, withLocalePrefix } from '../utils/locale-paths'

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default defineCachedEventHandler(
  async (event) => {
    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const defaultCode = await getDefaultLocaleCode()

    const urls = await listSitemapUrls()

    const entries = urls
      .map(({ paths, lastmod }) => {
        const codes = Object.keys(paths)
        return codes
          .map((code) => {
            const loc = `${origin}${withLocalePrefix(paths[code]!, code, defaultCode)}`
            const alternates = codes
              .map((altCode) => `    <xhtml:link rel="alternate" hreflang="${altCode}" href="${origin}${withLocalePrefix(paths[altCode]!, altCode, defaultCode)}" />`)
              .join('\n')
            const xDefaultPath = paths[defaultCode] ?? paths[codes[0]!]!
            return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod.toISOString()}</lastmod>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(`${origin}${withLocalePrefix(xDefaultPath, defaultCode, defaultCode)}`)}" />\n  </url>`
          })
          .join('\n')
      })
      .join('\n')

    setHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`
  },
  { maxAge: 300 },
)
