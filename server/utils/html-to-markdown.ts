/**
 * A small, deliberately non-exhaustive HTML → Markdown converter for the optional
 * `text/markdown` content-negotiation export (prompt.md §15.4). The source HTML always
 * comes from our own TipTap editor output (already sanitized before storage — see
 * sanitize-rich-text.ts), so this only needs to cover the tags TipTap actually produces,
 * not arbitrary HTML from the wider web.
 */
export function htmlToMarkdown(html: string | undefined): string {
  if (!html) return ''

  let text = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n### $1\n')
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gis, '**$2**')
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gis, '_$2_')
    .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gis, '[$2]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n')
    .replace(/<\/(ul|ol)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')

  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return text.replace(/\n{3,}/g, '\n\n').trim()
}
