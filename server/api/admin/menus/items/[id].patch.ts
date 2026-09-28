import { menuItemInputSchema } from '../../../../../shared/schemas/menus'
import { updateMenuItem } from '../../../../services/menus.service'
import { requireSessionWithRole } from '../../../../utils/session'
import { keysActuallySent } from '../../../../utils/partial-update'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing menu item id' })
  }

  const body = await readBody(event)
  const parsed = menuItemInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  return updateMenuItem(id, keysActuallySent(parsed.data, body))
})
