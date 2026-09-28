import type { MediaItem } from '#shared/types/media'

type MediaSummary = Pick<MediaItem, 'id' | 'sizes' | 'altText'>

/** Resolves one or more media ids to their URLs/alt text for public block rendering. */
export async function fetchMediaMap(ids: (string | undefined)[]): Promise<Record<string, MediaSummary>> {
  const uniqueIds = [...new Set(ids.filter((id): id is string => Boolean(id)))]
  if (uniqueIds.length === 0) return {}

  const items = await $fetch<MediaSummary[]>('/api/content/media', { query: { ids: uniqueIds.join(',') } })
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

export function mediaUrl(media: MediaSummary | undefined, size: 'thumb' | 'medium' | 'large' | 'original' = 'medium'): string {
  if (!media) return ''
  return media.sizes[size] ?? media.sizes.original ?? Object.values(media.sizes)[0] ?? ''
}

/** Alt text for an `<img>` rendering this media, falling back to `de` then any available language. */
export function mediaAlt(media: MediaSummary | undefined, locale: string): string {
  if (!media?.altText) return ''
  return media.altText[locale] || media.altText.de || Object.values(media.altText)[0] || ''
}
