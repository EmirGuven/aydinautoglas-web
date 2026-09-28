<script setup lang="ts">
/** Static preview + "load map" button until the visitor opts in (prompt.md §8: no map iframe before consent/click). */
const props = defineProps<{ latitude?: string | null; longitude?: string | null; label?: string }>()

const { hasConsent } = useCookieConsent()
const loaded = ref(false)

onMounted(() => {
  if (hasConsent('functional')) loaded.value = true
})

const embedUrl = computed(() => {
  if (!props.latitude || !props.longitude) return undefined
  const lat = Number(props.latitude)
  const lon = Number(props.longitude)
  const bbox = `${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
})
</script>

<template>
  <div v-if="embedUrl">
    <iframe
      v-if="loaded"
      :src="embedUrl"
      class="aspect-video w-full rounded-lg border border-slate-200 dark:border-slate-700"
      loading="lazy"
      :title="label || 'Map'"
    />
    <div
      v-else
      class="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-100 p-6 text-center dark:border-slate-700 dark:bg-slate-800"
    >
      <p class="max-w-xs text-xs text-text/60">{{ $t('map.consentNotice') }}</p>
      <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="loaded = true">
        {{ $t('map.loadPrompt') }}
      </button>
    </div>
  </div>
</template>
