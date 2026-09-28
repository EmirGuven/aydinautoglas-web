import DOMPurify from 'isomorphic-dompurify'

/** Sanitizes every language's HTML in a translatable rich-text field ({ de: '<p>...</p>', en: ... }). */
export function sanitizeTranslatableHtml(value: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(value).map(([locale, html]) => [locale, DOMPurify.sanitize(html)]))
}
