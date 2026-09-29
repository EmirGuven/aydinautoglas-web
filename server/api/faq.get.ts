// GET /api/faq — public, tüm SSS gruplarını ve sorularını döner
import { getDb } from "../utils/db"
import { normalizeLocale, getTranslationMapBulk } from "../utils/translations"

export default defineEventHandler(async (event) => {
  const db = await getDb()
  const locale = normalizeLocale(getQuery(event).locale)
  const groups = await db.prepare("SELECT * FROM faq_groups ORDER BY sort_order, id").all() as any[]
  const items  = await db.prepare("SELECT * FROM faq_items ORDER BY group_id, sort_order, id").all() as any[]

  const groupTranslations = await getTranslationMapBulk("faq_group", groups.map(g => g.id), locale)
  const itemTranslations = await getTranslationMapBulk("faq_item", items.map(i => i.id), locale)

  return groups.map((g) => ({
    id       : g.id,
    category : groupTranslations[g.id]?.category || g.category,
    sort_order: g.sort_order,
    items    : items
      .filter((i) => i.group_id === g.id)
      .map((i) => ({
        id: i.id,
        question: itemTranslations[i.id]?.question || i.question,
        answer: itemTranslations[i.id]?.answer || i.answer,
        sort_order: i.sort_order,
      }))
  })) // düz array döner — sss.vue FaqGroup[] bekliyor
})
