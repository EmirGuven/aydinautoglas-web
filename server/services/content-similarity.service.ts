import { eq, ne } from 'drizzle-orm'
import { db } from '../db/client'
import { pageBlocks, pages } from '../db/schema'
import { pickTranslatedServer } from '../utils/i18n'

/**
 * A simple Jaccard word-overlap check across page content, used to warn an editor when a
 * newly created page (typically a city×service "doorway" landing page — prompt.md §15.3)
 * looks too similar to an existing one. This is a soft warning, not a hard block: some
 * genuine near-duplication (e.g. two branch pages sharing boilerplate) is expected and fine.
 */
const SIMILARITY_THRESHOLD = 0.5
const MIN_WORDS_TO_COMPARE = 20

function extractPlainText(blocks: { data: unknown }[], locale = 'de'): string {
  const parts: string[] = []
  for (const block of blocks) {
    const data = block.data as Record<string, unknown>
    for (const key of ['heading', 'subheading', 'content', 'text']) {
      const value = data[key] as Record<string, string> | undefined
      if (value) parts.push(pickTranslatedServer(value, locale).replace(/<[^>]+>/g, ' '))
    }
  }
  return parts.join(' ').toLowerCase()
}

function toWordSet(text: string): Set<string> {
  return new Set(text.split(/\W+/).filter((word) => word.length > 3))
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const word of a) if (b.has(word)) intersection++
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

export async function checkPageSimilarity(pageId: string): Promise<{ pageId: string; title: string; score: number }[]> {
  const targetBlocks = await db.select().from(pageBlocks).where(eq(pageBlocks.pageId, pageId))
  const targetWords = toWordSet(extractPlainText(targetBlocks))
  if (targetWords.size < MIN_WORDS_TO_COMPARE) return []

  const otherPages = await db.select().from(pages).where(ne(pages.id, pageId))
  const results: { pageId: string; title: string; score: number }[] = []

  for (const other of otherPages) {
    const otherBlocks = await db.select().from(pageBlocks).where(eq(pageBlocks.pageId, other.id))
    const score = jaccardSimilarity(targetWords, toWordSet(extractPlainText(otherBlocks)))
    if (score >= SIMILARITY_THRESHOLD) {
      results.push({ pageId: other.id, title: pickTranslatedServer(other.title, 'de'), score })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}
