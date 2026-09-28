<script setup lang="ts">
import type { CookieCategory } from '~/composables/useCookieConsent'

const { locale } = useI18n()
const { hasDecided, setConsent } = useCookieConsent()
const { data: settings } = await usePublicSettings()
const cookieBanner = computed(() => settings.value?.cookieBanner)

const isCustomizing = ref(false)
const selected = ref<CookieCategory[]>([])

const offeredCategories = computed(() => (cookieBanner.value?.categories ?? ['necessary']) as CookieCategory[])
const optionalCategories = computed(() => offeredCategories.value.filter((c) => c !== 'necessary'))

function acceptAll() {
  setConsent(offeredCategories.value)
}
function rejectAll() {
  setConsent([])
}
function saveSelection() {
  setConsent(selected.value)
}
</script>

<template>
  <div
    v-if="!hasDecided()"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h2 class="font-semibold text-text">{{ $t('cookieConsent.title') }}</h2>
        <p class="mt-1 text-sm text-text/70">{{ pickTranslated(cookieBanner?.text, locale) }}</p>
      </div>

      <div v-if="isCustomizing" class="flex flex-col gap-2">
        <label v-for="category in offeredCategories" :key="category" class="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            :checked="category === 'necessary' || selected.includes(category)"
            :disabled="category === 'necessary'"
            @change="selected = selected.includes(category) ? selected.filter((c) => c !== category) : [...selected, category]"
          >
          {{ $t(`cookieConsent.${category}`) }}
        </label>
      </div>

      <div class="flex flex-wrap gap-3">
        <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="acceptAll">
          {{ $t('cookieConsent.acceptAll') }}
        </button>
        <button type="button" class="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-medium text-text dark:border-slate-600" @click="rejectAll">
          {{ $t('cookieConsent.rejectAll') }}
        </button>
        <button
          v-if="!isCustomizing && optionalCategories.length"
          type="button"
          class="min-h-11 px-2 text-sm underline text-text"
          @click="isCustomizing = true; selected = []"
        >
          {{ $t('cookieConsent.customize') }}
        </button>
        <button v-else-if="isCustomizing" type="button" class="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-medium text-text dark:border-slate-600" @click="saveSelection">
          {{ $t('cookieConsent.save') }}
        </button>
      </div>
    </div>
  </div>
</template>
