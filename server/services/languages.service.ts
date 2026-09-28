import { eq, ne } from 'drizzle-orm'
import { db } from '../db/client'
import { languages } from '../db/schema'
import type { Language } from '../../shared/schemas/languages'
import { ForbiddenError } from '../utils/permissions'

export async function listLanguages() {
  return db.select().from(languages).orderBy(languages.sortOrder)
}

export async function createLanguage(input: Language) {
  if (input.isDefault) {
    await db.update(languages).set({ isDefault: false }).where(ne(languages.code, input.code))
  }
  const [created] = await db.insert(languages).values(input).returning()
  if (!created) throw new Error('Language insert did not return a row')
  return created
}

export async function updateLanguage(code: string, input: Partial<Language>) {
  if (input.isDefault) {
    await db.update(languages).set({ isDefault: false }).where(ne(languages.code, code))
  }
  const [updated] = await db.update(languages).set(input).where(eq(languages.code, code)).returning()
  if (!updated) {
    throw new Error('Language not found')
  }
  return updated
}

export async function deleteLanguage(code: string) {
  const [target] = await db.select().from(languages).where(eq(languages.code, code)).limit(1)
  if (target?.isDefault) {
    throw new ForbiddenError('Cannot delete the default language')
  }
  await db.delete(languages).where(eq(languages.code, code))
}
