<script setup lang="ts">
interface LanguageRow {
  code: string
  nativeName: string
  flagEmoji: string
}

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const contentPaths = useContentLocalePaths()
const { data: languages } = await useFetch<LanguageRow[]>('/api/languages')

const isOpen = ref(false)

function targetPath(code: string) {
  return contentPaths.value?.[code] ?? switchLocalePath(code as never) ?? '/'
}

const current = computed(() => languages.value?.find((l) => l.code === locale.value))
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex min-h-11 items-center gap-1 rounded-md px-2 text-sm text-text hover:bg-black/5"
      :aria-label="`Language: ${current?.nativeName ?? locale}`"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span>{{ current?.flagEmoji }}</span>
      <span class="hidden sm:inline">{{ current?.nativeName ?? locale }}</span>
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 z-20 mt-1 min-w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
      @click="isOpen = false"
    >
      <NuxtLink
        v-for="lang in languages"
        :key="lang.code"
        :to="targetPath(lang.code)"
        class="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-black/5"
        :class="{ 'font-semibold': lang.code === locale }"
      >
        <span>{{ lang.flagEmoji }}</span>
        <span>{{ lang.nativeName }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
