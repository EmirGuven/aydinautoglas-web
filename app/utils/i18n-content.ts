/** Picks a translated value for `locale`, falling back to `de` (the default locale), then any available value. */
export function pickTranslated(
  record: Record<string, string> | undefined | null,
  locale: string,
  fallbackLocale = 'de',
): string {
  if (!record) return ''
  return record[locale] || record[fallbackLocale] || Object.values(record)[0] || ''
}
