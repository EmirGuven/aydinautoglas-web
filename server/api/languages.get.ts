import { listLanguages } from '../services/languages.service'

/** Public: active languages, used by the locale switcher, sitemap, hreflang defaults and llms.txt. */
export default defineCachedEventHandler(
  async () => {
    const languages = await listLanguages()
    return languages.filter((l) => l.isActive)
  },
  { maxAge: 60 },
)
