import { reorderMenuItemsSchema } from '../../../../../shared/schemas/menus'
import { reorderMenuItems } from '../../../../services/menus.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  const body = await readBody(event)
  const parsed = reorderMenuItemsSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  await reorderMenuItems(parsed.data)
  return { success: true }
})
