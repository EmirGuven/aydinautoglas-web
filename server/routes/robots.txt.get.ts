import { getSetting } from '../services/site-settings.service'

export default defineCachedEventHandler(
  async (event) => {
    const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
    const robots = await getSetting('robots')
    const botRules = robots?.botRules ?? {}

    const botBlocks = Object.entries(botRules).flatMap(([bot, rule]) => [
      `User-agent: ${bot}`,
      rule === 'disallow' ? 'Disallow: /' : 'Allow: /',
      '',
    ])

    const lines = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api',
      '',
      ...botBlocks,
      ...(robots?.extraRules ? [robots.extraRules.trim(), ''] : []),
      `Sitemap: ${origin}/sitemap.xml`,
    ]

    setHeader(event, 'content-type', 'text/plain; charset=utf-8')
    return lines.join('\n')
  },
  { maxAge: 300 },
)
