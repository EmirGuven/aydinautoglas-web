<script setup lang="ts">
interface SeoValue {
  metaTitle?: string
  metaDescription?: string
  noindex?: boolean
  focusKeyword?: string
  shortAnswer?: string
}

const props = defineProps<{ titleFallback: string; url: string }>()
const model = defineModel<SeoValue>({ required: true })
const { t } = useAdminI18n()

const inputClass = 'min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

const effectiveTitle = computed(() => model.value.metaTitle || props.titleFallback)
const titleLength = computed(() => effectiveTitle.value.length)
const descriptionLength = computed(() => (model.value.metaDescription ?? '').length)

// Real pixel width (canvas measureText) is only available client-side; server-render and the
// first client paint fall back to 0, which is fine since this is a soft visual aid, not a
// blocking validation.
let measureCanvas: HTMLCanvasElement | undefined
function measurePixelWidth(text: string, font: string): number {
  if (!import.meta.client) return 0
  measureCanvas ??= document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(text).width
}

const TITLE_MAX_PX = 600
const DESCRIPTION_MAX_PX = 920

const titlePixelWidth = computed(() => measurePixelWidth(effectiveTitle.value, '20px arial'))
const descriptionPixelWidth = computed(() => measurePixelWidth(model.value.metaDescription ?? '', '14px arial'))
const titlePixelPct = computed(() => Math.min(100, (titlePixelWidth.value / TITLE_MAX_PX) * 100))
const descriptionPixelPct = computed(() => Math.min(100, (descriptionPixelWidth.value / DESCRIPTION_MAX_PX) * 100))

const checklist = computed(() => {
  const kw = (model.value.focusKeyword ?? '').trim().toLowerCase()
  return [
    { ok: titleLength.value > 0 && titleLength.value <= 60, label: t('seoPanel.checkTitleLength') },
    { ok: descriptionLength.value >= 50 && descriptionLength.value <= 160, label: t('seoPanel.checkDescriptionLength') },
    { ok: !!kw, label: t('seoPanel.checkFocusKeyword') },
    { ok: !!kw && effectiveTitle.value.toLowerCase().includes(kw), label: t('seoPanel.checkKeywordInTitle') },
    { ok: !!kw && (model.value.metaDescription ?? '').toLowerCase().includes(kw), label: t('seoPanel.checkKeywordInDescription') },
    { ok: !!(model.value.shortAnswer ?? '').trim(), label: t('seoPanel.checkShortAnswer') },
  ]
})
const score = computed(() => Math.round((checklist.value.filter((c) => c.ok).length / checklist.value.length) * 100))
const scoreColor = computed(() => (score.value >= 80 ? 'text-emerald-600' : score.value >= 50 ? 'text-amber-600' : 'text-red-600'))
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
    <AdminFormField :label="t('seoPanel.focusKeyword')" :hint="t('seoPanel.focusKeywordHint')">
      <input v-model="model.focusKeyword" :class="inputClass">
    </AdminFormField>

    <AdminFormField :label="t('seoPanel.metaTitle')" :hint="t('seoPanel.metaTitleHint')">
      <input v-model="model.metaTitle" :class="inputClass">
      <div class="mt-1 flex items-center justify-between text-xs text-slate-400">
        <span>{{ t('seoPanel.charsCount', { count: titleLength }) }}</span>
      </div>
      <div class="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          class="h-full rounded-full"
          :class="titlePixelPct > 100 ? 'bg-red-500' : 'bg-primary'"
          :style="{ width: `${Math.min(100, titlePixelPct)}%` }"
        />
      </div>
    </AdminFormField>

    <AdminFormField :label="t('seoPanel.metaDescription')">
      <textarea v-model="model.metaDescription" rows="2" :class="[inputClass, 'py-2']" />
      <div class="mt-1 flex items-center justify-between text-xs text-slate-400">
        <span>{{ t('seoPanel.charsCount', { count: descriptionLength }) }}</span>
      </div>
      <div class="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          class="h-full rounded-full"
          :class="descriptionPixelPct > 100 ? 'bg-red-500' : 'bg-primary'"
          :style="{ width: `${Math.min(100, descriptionPixelPct)}%` }"
        />
      </div>
    </AdminFormField>

    <div>
      <p class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('seoPanel.searchPreview') }}</p>
      <div class="rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <p class="truncate text-xs text-emerald-700 dark:text-emerald-500">{{ url }}</p>
        <p class="truncate text-base text-blue-700 dark:text-blue-400">{{ effectiveTitle || titleFallback }}</p>
        <p class="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{{ model.metaDescription }}</p>
      </div>
    </div>

    <AdminFormField :label="t('seoPanel.shortAnswer')" :hint="t('seoPanel.shortAnswerHint')">
      <textarea v-model="model.shortAnswer" rows="2" :class="[inputClass, 'py-2']" />
    </AdminFormField>

    <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input v-model="model.noindex" type="checkbox">
      {{ t('seoPanel.noindex') }}
    </label>

    <div>
      <div class="mb-1 flex items-center justify-between">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('seoPanel.checklistTitle') }}</p>
        <p class="text-xs font-semibold" :class="scoreColor">{{ score }}%</p>
      </div>
      <ul class="flex flex-col gap-1">
        <li
          v-for="item in checklist"
          :key="item.label"
          class="flex items-center gap-2 text-xs"
          :class="item.ok ? 'text-emerald-600' : 'text-slate-400'"
        >
          <span>{{ item.ok ? '✓' : '○' }}</span>
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
