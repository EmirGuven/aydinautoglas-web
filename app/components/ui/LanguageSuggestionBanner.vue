<script setup lang="ts">
/**
 * Suggests switching to the visitor's browser language on first visit — never redirects
 * automatically (prompt.md §14: forced redirects are bad for SEO). Dismissal is remembered
 * per-browser via localStorage, not a server cookie, since this is purely a client nicety.
 */
interface LanguageRow {
  code: string
  nativeName: string
}

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { data: languages } = await useFetch<LanguageRow[]>('/api/languages')

const suggested = ref<LanguageRow | null>(null)
const DISMISS_KEY = 'lang-suggestion-dismissed'

onMounted(() => {
  try {
    if (localStorage.getItem(DISMISS_KEY)) return
  } catch {
    return
  }
  const browserCodes = navigator.languages ?? [navigator.language]
  const match = browserCodes
    .map((code) => code.split('-')[0])
    .map((code) => languages.value?.find((l) => l.code === code))
    .find((l) => l && l.code !== locale.value)
  if (match) suggested.value = match
})

function dismiss() {
  suggested.value = null
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // localStorage unavailable (private mode etc.) — banner just won't remember; harmless.
  }
}
</script>

<template>
  <div v-if="suggested" class="flex items-center justify-between gap-4 bg-slate-900 px-4 py-2 text-sm text-white">
    <p>{{ $t('languageBanner.text', { language: suggested.nativeName }) }}</p>
    <div class="flex shrink-0 items-center gap-3">
      <NuxtLink :to="switchLocalePath(suggested.code as never)" class="min-h-11 content-center underline" @click="dismiss">
        {{ $t('languageBanner.switch', { language: suggested.nativeName }) }}
      </NuxtLink>
      <button type="button" class="min-h-11 px-2 text-white/70" :aria-label="$t('languageBanner.dismiss')" @click="dismiss">
        &times;
      </button>
    </div>
  </div>
</template>
