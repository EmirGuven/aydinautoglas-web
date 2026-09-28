<script setup lang="ts">
/** Each admin user's own panel-language preference (prompt.md §14) — independent of the public site's locale. */
const PANEL_LOCALES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
] as const

const { user } = useAuth()
const { adminLocale } = useAdminI18n()
const toast = useToast()

const isOpen = ref(false)
const current = computed(() => PANEL_LOCALES.find((l) => l.code === adminLocale.value) ?? PANEL_LOCALES[0])

async function setLocale(code: string) {
  isOpen.value = false
  if (!user.value || code === adminLocale.value) return
  const previous = user.value.locale
  user.value.locale = code
  try {
    await $fetch(`/api/admin/users/${user.value.id}`, { method: 'PATCH', body: { locale: code } })
  } catch {
    user.value.locale = previous
    toast.error('Failed to save language preference.')
  }
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex h-11 w-11 items-center justify-center rounded-md text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
      :aria-label="`Panel language: ${current.label}`"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      {{ current.flag }}
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 z-20 mt-1 min-w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <button
        v-for="lang in PANEL_LOCALES"
        :key="lang.code"
        type="button"
        class="flex w-full min-h-11 items-center gap-2 px-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
        :class="{ 'font-semibold': lang.code === adminLocale }"
        @click="setLocale(lang.code)"
      >
        <span>{{ lang.flag }}</span>
        <span>{{ lang.label }}</span>
      </button>
    </div>
  </div>
</template>
