import { listAppointments, toCsv } from '../../../services/appointments.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const rows = await listAppointments()
  const csv = await toCsv(rows)
  setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="appointments.csv"')
  return csv
})
