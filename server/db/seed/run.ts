import { db, pool } from '../client'
import { languages } from '../schema'
import { seedAutoglassTemplate } from './templates/autoglass'
import { seedGenericServiceTemplate } from './templates/generic-service'
import { seedCoreTranslations } from './core-translations'

const TEMPLATES: Record<string, () => Promise<void>> = {
  autoglass: seedAutoglassTemplate,
  'generic-service': seedGenericServiceTemplate,
}

async function seedBaseLanguages() {
  await db
    .insert(languages)
    .values([
      { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪', isDefault: true, sortOrder: 0 },
      { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧', sortOrder: 1 },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷', sortOrder: 2 },
    ])
    .onConflictDoNothing({ target: languages.code })
}

async function main() {
  const templateArg = process.argv.find((arg) => arg.startsWith('--template='))
  const templateName = templateArg?.split('=')[1] ?? 'autoglass'
  const seedTemplate = TEMPLATES[templateName]

  if (!seedTemplate) {
    console.error(`Unknown template "${templateName}". Available: ${Object.keys(TEMPLATES).join(', ')}`)
    process.exit(1)
  }

  await seedBaseLanguages()
  await seedCoreTranslations()
  await seedTemplate()
  await pool.end()
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
