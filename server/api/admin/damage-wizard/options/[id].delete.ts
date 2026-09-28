import { deleteOption } from '../../../../services/damage-wizard.service'
import { requireSessionWithRole } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing option id' })
  await deleteOption(id)
  return { success: true }
})
