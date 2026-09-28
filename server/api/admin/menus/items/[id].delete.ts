import { deleteMenuItem } from '../../../../services/menus.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing menu item id' })
  }
  await deleteMenuItem(id)
  return { success: true }
})
