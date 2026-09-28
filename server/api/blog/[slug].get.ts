import { getPublishedBlogPostBySlug } from '../../services/blog.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const locale = typeof getQuery(event).locale === 'string' ? (getQuery(event).locale as string) : 'de'
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const post = await getPublishedBlogPostBySlug(locale, slug)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
  return post
})
