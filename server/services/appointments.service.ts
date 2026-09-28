import { desc, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { appointments } from '../db/schema'
import type { AppointmentSubmission, AppointmentUpdate } from '../../shared/schemas/appointments'

export async function listAppointments() {
  return db.select().from(appointments).orderBy(desc(appointments.createdAt))
}

export async function getAppointmentById(id: string) {
  const [row] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1)
  if (!row) throw new Error('Appointment not found')
  return row
}

export async function createAppointment(input: AppointmentSubmission) {
  const {
    contactName,
    contactEmail,
    contactPhone,
    locale,
    consent: _consent,
    companyWebsite: _honeypot,
    ...formData
  } = input

  const [created] = await db
    .insert(appointments)
    .values({ formData, contactName, contactEmail, contactPhone, locale })
    .returning()
  if (!created) throw new Error('Appointment insert did not return a row')
  return created
}

export async function updateAppointment(id: string, input: AppointmentUpdate) {
  const [updated] = await db
    .update(appointments)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning()
  if (!updated) throw new Error('Appointment not found')
  return updated
}

export async function toCsv(rows: Awaited<ReturnType<typeof listAppointments>>): Promise<string> {
  const header = ['Date', 'Name', 'Email', 'Phone', 'Status', 'Locale', 'Notes']
  const lines = rows.map((row) =>
    [
      row.createdAt.toISOString(),
      row.contactName,
      row.contactEmail,
      row.contactPhone ?? '',
      row.status,
      row.locale,
      (row.adminNotes ?? '').replace(/\n/g, ' '),
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}
