// GET  /api/admin/translations                       — çevrilebilir içerik türlerini listeler
// GET  /api/admin/translations?type=X                 — o türdeki kayıtları listeler (listable ise)
// GET  /api/admin/translations?type=X&id=Y            — bir kaydın alan/dil çevirilerini getirir
// PUT  /api/admin/translations?type=X&id=Y            — bir dildeki alan çevirilerini kaydeder
import { getDb } from "../../utils/db"
import { verifyToken, parseCookies } from "../../utils/auth"
import { TRANSLATABLE_CONTENT } from "../../utils/translatable-content"
import { getAllTranslations, saveTranslation, SUPPORTED_LOCALES } from "../../utils/translations"

async function checkAuth(event: any) {
  const cookies = parseCookies(getHeader(event, "cookie") || null)
  const payload = await verifyToken(cookies.admin_token || "")
  if (!payload) throw createError({ statusCode: 401, message: "Yetkisiz erişim." })
}

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const db = await getDb()
  const query = getQuery(event)
  const type = query.type as string | undefined
  const id = query.id ? Number(query.id) : undefined

  if (event.method === "GET") {
    if (!type) {
      return Object.entries(TRANSLATABLE_CONTENT).map(([key, cfg]) => ({
        type: key, label: cfg.label, listable: !!cfg.listable,
      }))
    }

    const cfg = TRANSLATABLE_CONTENT[type]
    if (!cfg) throw createError({ statusCode: 404, message: "Bilinmeyen içerik türü." })

    if (id === undefined) {
      if (!cfg.listable) {
        // tekil sayfa (id=1)
        return [{ id: 1, title: cfg.label }]
      }
      const rows = await db.prepare(`SELECT id, ${cfg.titleField} AS title FROM ${cfg.table} ORDER BY id ASC`).all() as any[]
      return rows.map(r => ({ id: r.id, title: r.title || `#${r.id}` }))
    }

    const row = await db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(id) as any
    if (!row) throw createError({ statusCode: 404, message: "Kayıt bulunamadı." })

    const base: Record<string, string> = {}
    for (const f of cfg.fields) base[f] = row[f] || ""

    const allTranslations = await getAllTranslations(type, id)
    const byLocale: Record<string, Record<string, string>> = {}
    for (const locale of SUPPORTED_LOCALES) byLocale[locale] = {}
    for (const t of allTranslations) {
      if (!byLocale[t.locale]) byLocale[t.locale] = {}
      byLocale[t.locale][t.field] = t.value
    }
    byLocale.de = base

    return { fields: cfg.fields, locales: byLocale }
  }

  if (event.method === "PUT") {
    if (!type || id === undefined) throw createError({ statusCode: 400, message: "type ve id gerekli." })
    const cfg = TRANSLATABLE_CONTENT[type]
    if (!cfg) throw createError({ statusCode: 404, message: "Bilinmeyen içerik türü." })

    const body = await readBody(event)
    const locale = String(body.locale || "")
    if (locale === "de" || !SUPPORTED_LOCALES.includes(locale as any)) {
      throw createError({ statusCode: 400, message: "Geçersiz dil (yalnızca en/tr çevirisi kaydedilebilir)." })
    }

    const values = body.values || {}
    for (const field of cfg.fields) {
      if (Object.prototype.hasOwnProperty.call(values, field)) {
        await saveTranslation(type, id, locale, field, String(values[field] || ""))
      }
    }
    return { success: true }
  }
})
