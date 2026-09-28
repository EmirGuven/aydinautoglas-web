import { siteSettingsSchemas, type SiteSettingsKey } from '../../../../shared/schemas/site-settings'
import { getSetting } from '../../../services/site-settings.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'admin')
  const key = getRouterParam(event, 'key') as SiteSettingsKey

  if (!(key in siteSettingsSchemas)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown settings key' })
  }

  return (await getSetting(key)) ?? {}
})
