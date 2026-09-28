/** Server-side counterpart of app/utils/i18n-content.ts's pickTranslated (kept separate since server code can't import from app/). */
export function pickTranslatedServer(
  record: Record<string, string> | undefined | null,
  locale: string,
  fallbackLocale = 'de',
): string {
  if (!record) return ''
  return record[locale] || record[fallbackLocale] || Object.values(record)[0] || ''
}
