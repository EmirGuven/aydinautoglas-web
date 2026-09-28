import { getActiveTheme } from '../services/theme.service'

export default defineEventHandler(async () => getActiveTheme())
