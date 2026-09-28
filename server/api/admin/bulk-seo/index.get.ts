import { db } from '../../../db/client'
import { blogPosts, pages, services } from '../../../db/schema'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')

  const [allPages, allServices, allPosts] = await Promise.all([
    db.select({ id: pages.id, title: pages.title, seo: pages.seo }).from(pages),
    db.select({ id: services.id, title: services.title, seo: services.seo }).from(services),
    db.select({ id: blogPosts.id, title: blogPosts.title, seo: blogPosts.seo }).from(blogPosts),
  ])

  return [
    ...allPages.map((row) => ({ contentType: 'page' as const, ...row })),
    ...allServices.map((row) => ({ contentType: 'service' as const, ...row })),
    ...allPosts.map((row) => ({ contentType: 'blogPost' as const, ...row })),
  ]
})
