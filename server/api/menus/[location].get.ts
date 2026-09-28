import { menuLocationSchema } from '../../../shared/schemas/menus'
import { getMenuTree } from '../../services/menus.service'

/** Public: GET /api/menus/header or /api/menus/footer */
export default defineEventHandler(async (event) => {
  const parsed = menuLocationSchema.safeParse(getRouterParam(event, 'location'))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid menu location' })
  }
  return getMenuTree(parsed.data)
})
