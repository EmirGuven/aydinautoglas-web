import { listBlogCategories } from '../../../../services/blog.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listBlogCategories()
})
