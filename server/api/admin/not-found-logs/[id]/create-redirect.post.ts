import { z } from 'zod'
import { getNotFoundLogById, deleteNotFoundLog } from '../../../../services/not-found-logs.service'
import { createRedirect } from '../../../../services/redirects.service'
import { requireSessionWithRole } from '../../../../utils/session'

const bodySchema = z.object({
  toPath: z.string().min(1),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
})

/** Turns a logged 404 into a redirect with one click (prompt.md §15.1), then clears the log. */
export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing log id' })

  const log = await getNotFoundLogById(id)
  if (!log) throw createError({ statusCode: 404, statusMessage: 'Not-found log not found' })

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  const redirect = await createRedirect({ fromPath: log.path, toPath: parsed.data.toPath, statusCode: parsed.data.statusCode })
  await deleteNotFoundLog(id)
  return redirect
})
