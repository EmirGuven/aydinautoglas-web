import { menuItemInputSchema, menuLocationSchema } from '../../../../../shared/schemas/menus'
import { createMenuItem } from '../../../../services/menus.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  const location = menuLocationSchema.safeParse(getRouterParam(event, 'location'))
  if (!location.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid menu location' })
  }

  const body = await readBody(event)
  const parsed = menuItemInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  setResponseStatus(event, 201)
  return createMenuItem(location.data, parsed.data)
})
