// GET /api/blog — public, yayınlanmış blog yazılarını döner
import { getDb } from "../utils/db"
import { normalizeLocale, getTranslationMap, getTranslationMapBulk, applyTranslations } from "../utils/translations"

const TRANSLATABLE_FIELDS = ["title", "excerpt", "content", "category", "quote", "read_time"]

export default defineEventHandler(async (event) => {
  const db = await getDb()
  const query = getQuery(event)
  const slug = query.slug as string | undefined
  const locale = normalizeLocale(query.locale)

  if (slug) {
    const post = await db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1").get(slug) as any
    if (!post) throw createError({ statusCode: 404, message: "Beitrag nicht gefunden" })
    const translations = await getTranslationMap("blog_post", post.id, locale)
    return formatPost(applyTranslations(post, translations, TRANSLATABLE_FIELDS))
  }

  const posts = await db.prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC").all() as any[]
  const bulk = await getTranslationMapBulk("blog_post", posts.map(p => p.id), locale)
  return posts.map(p => formatPost(applyTranslations(p, bulk[p.id] || {}, TRANSLATABLE_FIELDS)))
})

function formatPost(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content || '',
    category: p.category,
    tags: p.tags || '',
    quote: p.quote || '',
    readTime: p.read_time,
    date: p.date,
    image: p.image,
    featured: p.featured === 1,
    published: p.published === 1
  }
}
