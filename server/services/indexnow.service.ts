import { getSetting } from './site-settings.service'

/**
 * Best-effort notification to Bing/Yandex (and anyone else on the shared IndexNow API) that
 * a URL was published or updated (prompt.md §15.1). No-ops silently if IndexNow isn't enabled,
 * and never throws — a failed or unreachable ping must never break an admin's content save
 * (same principle as the SMTP no-op in server/services/email.service.ts).
 */
export async function pingIndexNow(origin: string, urls: string[]): Promise<void> {
  if (urls.length === 0) return
  try {
    const settings = await getSetting('indexNow')
    if (!settings?.enabled || !settings.key) return

    await $fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      body: {
        host: new URL(origin).host,
        key: settings.key,
        keyLocation: `${origin}/${settings.key}.txt`,
        urlList: urls,
      },
      retry: 0,
    })
  } catch {
    // Network failure, IndexNow being unreachable from this environment, etc. — never surface this to the caller.
  }
}
