import { getTableName, sql } from 'drizzle-orm'
import { db } from '../db/client'
import {
  blogCategories,
  blogPosts,
  damageWizardOptions,
  damageWizardQuestions,
  damageWizardRules,
  faqCategories,
  faqs,
  locations,
  menuItems,
  menus,
  pageBlocks,
  pages,
  services,
  testimonials,
} from '../db/schema'
import { setSetting } from './site-settings.service'
import { seedAutoglassTemplate } from '../db/seed/templates/autoglass'
import { seedGenericServiceTemplate } from '../db/seed/templates/generic-service'

export const SECTOR_TEMPLATES = [
  {
    key: 'autoglass',
    name: 'Auto Glass',
    description: 'Full DE/EN/TR content for an auto-glass repair & replacement company: services, branches, FAQs, testimonials, damage wizard, a blog post and legal pages.',
  },
  {
    key: 'generic-service',
    name: 'Generic Service Business',
    description: 'A lighter, sector-agnostic skeleton (cleaning/maintenance flavored) proving the same codebase adapts to any service business.',
  },
] as const

export type SectorTemplateKey = (typeof SECTOR_TEMPLATES)[number]['key']

const SEED_FNS: Record<SectorTemplateKey, () => Promise<void>> = {
  autoglass: seedAutoglassTemplate,
  'generic-service': seedGenericServiceTemplate,
}

/** Tables a template seed writes to — truncated before applying a new one, snapshotted before that. */
const CONTENT_TABLES = [
  pageBlocks,
  pages,
  services,
  locations,
  faqs,
  faqCategories,
  testimonials,
  damageWizardOptions,
  damageWizardRules,
  damageWizardQuestions,
  menuItems,
  menus,
  blogPosts,
  blogCategories,
] as const

export function listSectorTemplates() {
  return SECTOR_TEMPLATES
}

/**
 * Snapshots every content table applying a template will touch into a single JSON blob
 * stored under `site_settings.lastTemplateBackup`. Deliberately a single slot, not a full
 * history — this is a safety net against "I applied the wrong template", not a backup
 * system (see docs/deployment.md for real backups once Phase 10 adds them).
 */
async function backupCurrentContent(): Promise<void> {
  const snapshot: Record<string, Record<string, unknown>[]> = {}
  for (const table of CONTENT_TABLES) {
    snapshot[getTableName(table)] = (await db.select().from(table as never)) as Record<string, unknown>[]
  }
  await setSetting('lastTemplateBackup', { takenAt: new Date().toISOString(), tables: snapshot })
}

async function clearContentTables(): Promise<void> {
  for (const table of CONTENT_TABLES) {
    await db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`)
  }
}

export async function applySectorTemplate(templateKey: SectorTemplateKey): Promise<void> {
  const seed = SEED_FNS[templateKey]
  if (!seed) throw new Error(`Unknown sector template "${templateKey}"`)

  await backupCurrentContent()
  await clearContentTables()
  // Each template's own seed function sets `site_settings.general` (company name +
  // activeSectorTemplate) as part of its content — applying a template is meant to
  // transform the site, company name included; rename the company afterward via Settings
  // if you want to keep your existing name on a new template's structure.
  await seed()
}
