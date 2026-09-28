import { db } from '../db/client'
import { contactMessages } from '../db/schema'
import type { ContactMessageInput } from '../../shared/schemas/contact'

/** Admin email notification + customer confirmation email land in Phase 6. */
export async function submitContactMessage(input: ContactMessageInput) {
  const [created] = await db
    .insert(contactMessages)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      locale: input.locale,
    })
    .returning()

  if (!created) throw new Error('Contact message insert did not return a row')
  return created
}
