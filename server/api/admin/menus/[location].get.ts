import { menuLocationSchema } from '../../../../shared/schemas/menus'
import { getMenuTree } from '../../../services/menus.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const parsed = menuLocationSchema.safeParse(getRouterParam(event, 'location'))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid menu location' })
  }
  return getMenuTree(parsed.data)
})
