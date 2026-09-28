import { inArray } from 'drizzle-orm'
import { db } from '../db/client'
import { media } from '../db/schema'

export async function getMediaByIds(ids: string[]) {
  if (ids.length === 0) return []
  return db
    .select({ id: media.id, sizes: media.sizes, altText: media.altText })
    .from(media)
    .where(inArray(media.id, ids))
}
