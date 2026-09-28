import { languageSchema } from '../../../../shared/schemas/languages'
import { createLanguage } from '../../../services/languages.service'
import { requireSessionWithRole } from '../../../utils/session'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'admin')
  const body = await readBody(event)
  const parsed = languageSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }

  try {
    setResponseStatus(event, 201)
    const created = await createLanguage(parsed.data)
    await recordAuditLog({
      userId: session.sub,
      action: 'language.create',
      entityType: 'language',
      entityId: created.code,
    })
    return created
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Language code already exists' })
    }
    throw error
  }
})
