import { db } from '../db/client'
import { theme } from '../db/schema'

export interface ThemeValues {
  colorPrimary: string
  colorSecondary: string
  colorAccent: string
  colorBackground: string
  colorText: string
  fontFamily: string
  borderRadius: string
  buttonStyle: string
}

const DEFAULT_THEME: ThemeValues = {
  colorPrimary: '#1d4ed8',
  colorSecondary: '#0f172a',
  colorAccent: '#f59e0b',
  colorBackground: '#ffffff',
  colorText: '#0f172a',
  fontFamily: 'system-ui, sans-serif',
  borderRadius: '0.5rem',
  buttonStyle: 'solid',
}

/**
 * Simple in-process cache (short TTL) for the single theme row: it's read on
 * every SSR page render, but only ever changed from the admin theme editor.
 * setTheme() invalidates it immediately so edits are visible without waiting
 * out the TTL.
 */
let cached: { value: ThemeValues; expiresAt: number } | null = null
const TTL_MS = 60_000

export async function getActiveTheme(): Promise<ThemeValues> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }
  const [row] = await db.select().from(theme).limit(1)
  const value = row ?? DEFAULT_THEME
  cached = { value, expiresAt: Date.now() + TTL_MS }
  return value
}

export async function setTheme(values: ThemeValues): Promise<ThemeValues> {
  const [updated] = await db
    .insert(theme)
    .values({ id: 'default', ...values })
    .onConflictDoUpdate({ target: theme.id, set: values })
    .returning()

  if (!updated) {
    throw new Error('Theme upsert did not return a row')
  }

  cached = { value: updated, expiresAt: Date.now() + TTL_MS }
  return updated
}
