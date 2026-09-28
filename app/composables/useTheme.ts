import type { ThemeValues } from '../../server/services/theme.service'

/**
 * Fetches the active theme and injects it as a synchronous <style>:root{...}</style>
 * tag via useHead. Because this runs during SSR before the response is sent,
 * the client hydrates with the same values already applied — no FOUC.
 */
export function useTheme() {
  const { data: activeTheme } = useFetch<ThemeValues>('/api/theme', {
    key: 'active-theme',
  })

  const cssText = computed(() => {
    const t = activeTheme.value
    if (!t) return ''
    return `:root{` +
      `--site-color-primary:${t.colorPrimary};` +
      `--site-color-secondary:${t.colorSecondary};` +
      `--site-color-accent:${t.colorAccent};` +
      `--site-color-background:${t.colorBackground};` +
      `--site-color-text:${t.colorText};` +
      `--site-color-surface:${t.colorSurface};` +
      `--site-color-border:${t.colorBorder};` +
      `--site-color-muted:${t.colorMuted};` +
      `--site-font-family:${t.fontFamily};` +
      `--site-font-family-heading:${t.fontFamilyHeading};` +
      `--site-radius-button:${t.borderRadius};` +
      `--site-radius-card:${t.radiusCard};` +
      `--site-shadow-card:${t.shadowCard};` +
      `--site-shadow-elevated:${t.shadowElevated};` +
      `}`
  })

  useHead({
    style: [{ innerHTML: cssText }],
  })

  return { theme: activeTheme }
}
