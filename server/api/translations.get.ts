import { getTranslationsMap } from '../services/translations.service'

/** Public: DB overrides for UI strings, merged into vue-i18n on top of the static locale-file fallback defaults (see app/composables/useDbTranslations.ts). */
export default defineCachedEventHandler(() => getTranslationsMap(), { maxAge: 60 })
