// İçerik çevirilerini (EN/TR) translations tablosuna yazar.
// Almanca (varsayılan dil) ana tablolarda kaldığı için burada yer almaz.
//
// Kullanım:
//   DATABASE_URL=postgresql://user:pass@host:5432/dbname npx jiti scripts/seed-translations.ts
//
// Tekrar çalıştırmak güvenlidir: her alan ON CONFLICT ile güncellenir.

import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { getDb } from "../server/utils/db"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TRANSLATIONS_DIR = join(__dirname, "translations")

interface Entry {
  type?: string
  key: Record<string, string | number>
  [locale: string]: any
}

// Kaydın id'sini çözer: { id: 1 } doğrudan, { slug } / { question } / { category } ise sorgu ile.
async function resolveContentId(db: any, type: string, key: Record<string, any>): Promise<number | null> {
  if (key.id !== undefined) return Number(key.id)

  const tableByType: Record<string, string> = {
    blog_post: "blog_posts",
    service_page: "service_pages",
    faq_item: "faq_items",
    faq_group: "faq_groups",
  }
  const table = tableByType[type]
  if (!table) return null

  const [column, value] = Object.entries(key)[0] as [string, any]
  const row = await db.prepare(`SELECT id FROM ${table} WHERE ${column} = ?`).get(value)
  return row ? Number(row.id) : null
}

async function main() {
  const db = await getDb()

  const files = readdirSync(TRANSLATIONS_DIR).filter(f => f.endsWith(".json"))
  let saved = 0
  const missing: string[] = []

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(TRANSLATIONS_DIR, file), "utf-8")) as Record<string, Entry>

    for (const [entryKey, entry] of Object.entries(data)) {
      const type = entry.type || entryKey
      const contentId = await resolveContentId(db, type, entry.key)

      if (contentId === null) {
        missing.push(`${type} → ${JSON.stringify(entry.key)}`)
        continue
      }

      for (const locale of ["en", "tr"]) {
        const values = entry[locale]
        if (!values) continue

        for (const [field, value] of Object.entries(values as Record<string, string>)) {
          await db.prepare(`
            INSERT INTO translations (content_type, content_id, locale, field, value)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (content_type, content_id, locale, field) DO UPDATE SET value = EXCLUDED.value
          `).run(type, contentId, locale, field, String(value))
          saved++
        }
      }
      console.log(`✓ ${type}#${contentId} (${file})`)
    }
  }

  if (missing.length) {
    console.log("\n⚠ Eşleşmeyen kayıtlar (atlandı):")
    for (const m of missing) console.log("  -", m)
  }

  console.log(`\nToplam ${saved} çeviri alanı kaydedildi.`)
  process.exit(0)
}

main().catch((err) => {
  console.error("Çeviri seed başarısız:", err)
  process.exit(1)
})
