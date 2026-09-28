<script setup lang="ts">
import type { BlockType } from '#shared/schemas/blocks'

defineProps<{ type: BlockType }>()
// Block data shapes vary per type (see shared/schemas/blocks/*); this form edits a plain working copy.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = defineModel<Record<string, any>>('data', { required: true })
const { t } = useAdminI18n()

const inputClass = 'min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

function ensureText(field: string) {
  if (!data.value[field]) data.value[field] = {}
  return data.value[field]
}

function addItem(field: string, item: unknown) {
  if (!Array.isArray(data.value[field])) data.value[field] = []
  data.value[field].push(item)
}

function removeItem(field: string, index: number | string) {
  data.value[field].splice(Number(index), 1)
}

function addComparisonColumn() {
  if (!Array.isArray(data.value.columns)) data.value.columns = []
  data.value.columns.push({ de: '' })
  for (const row of data.value.rows ?? []) row.cells.push({ de: '' })
}

function removeComparisonColumn(index: number | string) {
  data.value.columns.splice(Number(index), 1)
  for (const row of data.value.rows ?? []) row.cells.splice(Number(index), 1)
}

function addComparisonRow() {
  if (!Array.isArray(data.value.rows)) data.value.rows = []
  data.value.rows.push({ label: { de: '' }, cells: (data.value.columns ?? []).map(() => ({ de: '' })) })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Fields shared by most blocks -->
    <AdminFormField v-if="'heading' in data" :label="t('blocks.headingDe')">
      <input v-model="ensureText('heading').de" :class="inputClass">
    </AdminFormField>
    <AdminFormField v-if="'subheading' in data" :label="t('blocks.subheadingDe')">
      <input v-model="ensureText('subheading').de" :class="inputClass">
    </AdminFormField>

    <template v-if="type === 'hero'">
      <AdminFormField :label="t('blocks.ctaLabelDe')">
        <input v-model="ensureText('ctaLabel').de" :class="inputClass">
      </AdminFormField>
      <AdminFormField :label="t('blocks.ctaLink')">
        <input v-model="data.ctaHref" placeholder="/kontakt" :class="inputClass">
      </AdminFormField>
      <AdminFormField :label="t('blocks.backgroundImage')">
        <AdminMediaPicker v-model="data.backgroundMediaId" />
      </AdminFormField>
      <AdminFormField :label="t('blocks.trustBadges')">
        <div class="flex flex-col gap-2">
          <div v-for="(badge, index) in data.badges" :key="index" class="flex items-center gap-2">
            <input v-model="badge.de" :placeholder="t('blocks.trustBadgePlaceholder')" :class="[inputClass, 'flex-1']">
            <button type="button" class="text-xs text-red-600 underline" @click="removeItem('badges', index)">{{ t('blocks.remove') }}</button>
          </div>
          <button type="button" class="w-fit rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-600" @click="addItem('badges', { de: '' })">
            {{ t('blocks.addTrustBadge') }}
          </button>
        </div>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'service-cards' || type === 'testimonials' || type === 'blog-preview'">
      <AdminFormField :label="t('blocks.limit')">
        <input v-model.number="data.limit" type="number" min="1" :class="inputClass">
      </AdminFormField>
      <AdminFormField v-if="type === 'service-cards'" :label="t('blocks.onlyFeatured')">
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input v-model="data.onlyFeatured" type="checkbox">
          {{ t('blocks.showOnlyFeaturedServices') }}
        </label>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'how-it-works' || type === 'why-us'">
      <AdminFormField :label="type === 'how-it-works' ? t('blocks.steps') : t('blocks.features')">
        <div class="flex flex-col gap-3">
          <div
            v-for="(item, index) in data[type === 'how-it-works' ? 'steps' : 'features']"
            :key="index"
            class="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700"
          >
            <input v-model="item.title.de" :placeholder="t('blocks.titlePlaceholder')" :class="inputClass">
            <input v-model="item.description.de" :placeholder="t('blocks.descriptionPlaceholder')" :class="inputClass">
            <select v-if="type === 'why-us'" v-model="item.icon" :class="inputClass">
              <option value="">{{ t('blocks.noIcon') }}</option>
              <option v-for="iconName in FEATURE_ICON_NAMES" :key="iconName" :value="iconName">{{ iconName }}</option>
            </select>
            <button
              type="button"
              class="w-fit text-xs text-red-600 underline"
              @click="removeItem(type === 'how-it-works' ? 'steps' : 'features', index)"
            >
              {{ t('blocks.remove') }}
            </button>
          </div>
          <button
            type="button"
            class="w-fit rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
            @click="addItem(type === 'how-it-works' ? 'steps' : 'features', { title: { de: '' }, description: { de: '' } })"
          >
            {{ t('blocks.addItem') }}
          </button>
        </div>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'stats-counter'">
      <AdminFormField :label="t('blocks.stats')">
        <div class="flex flex-col gap-3">
          <div
            v-for="(stat, index) in data.stats"
            :key="index"
            class="flex items-center gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700"
          >
            <input v-model="stat.label.de" :placeholder="t('blocks.labelPlaceholder')" :class="[inputClass, 'flex-1']">
            <input v-model.number="stat.value" type="number" :placeholder="t('blocks.valuePlaceholder')" :class="[inputClass, 'w-24']">
            <input v-model="stat.suffix" :placeholder="t('blocks.suffixPlaceholder')" :class="[inputClass, 'w-16']">
            <button type="button" class="text-xs text-red-600 underline" @click="removeItem('stats', index)">
              {{ t('blocks.remove') }}
            </button>
          </div>
          <button
            type="button"
            class="w-fit rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
            @click="addItem('stats', { label: { de: '' }, value: 0, suffix: '' })"
          >
            {{ t('blocks.addStat') }}
          </button>
        </div>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'cta-band'">
      <AdminFormField :label="t('blocks.ctaLabelDe')">
        <input v-model="ensureText('ctaLabel').de" :class="inputClass">
      </AdminFormField>
      <AdminFormField :label="t('blocks.ctaLink')">
        <input v-model="data.ctaHref" placeholder="/kontakt" :class="inputClass">
      </AdminFormField>
    </template>

    <template v-else-if="type === 'rich-text'">
      <AdminFormField :label="t('blocks.contentDe')">
        <AdminRichTextEditor v-model="ensureText('content').de" />
      </AdminFormField>
    </template>

    <template v-else-if="type === 'image-text'">
      <AdminFormField :label="t('blocks.textDe')">
        <AdminRichTextEditor v-model="ensureText('text').de" />
      </AdminFormField>
      <AdminFormField :label="t('blocks.image')">
        <AdminMediaPicker v-model="data.mediaId" />
      </AdminFormField>
      <AdminFormField :label="t('blocks.imagePosition')">
        <select v-model="data.imagePosition" :class="inputClass">
          <option value="left">{{ t('blocks.left') }}</option>
          <option value="right">{{ t('blocks.right') }}</option>
        </select>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'gallery'">
      <AdminFormField :label="t('blocks.images')">
        <div class="flex flex-wrap gap-3">
          <AdminMediaPicker
            v-for="(id, index) in data.mediaIds"
            :key="index"
            :model-value="id"
            @update:model-value="(v) => (v ? (data.mediaIds[index] = v) : removeItem('mediaIds', index))"
          />
          <AdminMediaPicker @update:model-value="(v) => v && addItem('mediaIds', v)" />
        </div>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'comparison-table'">
      <AdminFormField :label="t('blocks.columns')">
        <div class="flex flex-col gap-2">
          <div v-for="(column, index) in data.columns" :key="index" class="flex items-center gap-2">
            <input v-model="column.de" :placeholder="t('blocks.columnPlaceholder')" :class="[inputClass, 'flex-1']">
            <button type="button" class="text-xs text-red-600 underline" @click="removeComparisonColumn(index)">{{ t('blocks.remove') }}</button>
          </div>
          <button type="button" class="w-fit rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-600" @click="addComparisonColumn">
            {{ t('blocks.addColumn') }}
          </button>
        </div>
      </AdminFormField>
      <AdminFormField :label="t('blocks.rows')">
        <div class="flex flex-col gap-3">
          <div v-for="(row, rowIndex) in data.rows" :key="rowIndex" class="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <input v-model="row.label.de" :placeholder="t('blocks.rowLabelPlaceholder')" :class="inputClass">
            <input v-for="(_, colIndex) in data.columns" :key="colIndex" v-model="row.cells[colIndex].de" :placeholder="pickTranslated(data.columns[colIndex], 'de')" :class="inputClass">
            <button type="button" class="w-fit text-xs text-red-600 underline" @click="removeItem('rows', rowIndex)">{{ t('blocks.remove') }}</button>
          </div>
          <button type="button" class="w-fit rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-600" @click="addComparisonRow">
            {{ t('blocks.addRow') }}
          </button>
        </div>
      </AdminFormField>
    </template>

    <template v-else-if="type === 'certificates'">
      <AdminFormField :label="t('blocks.items')">
        <div class="flex flex-col gap-3">
          <div v-for="(item, index) in data.items" :key="index" class="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <input v-model="item.title.de" :placeholder="t('blocks.titlePlaceholder')" :class="inputClass">
            <input v-model="item.issuer.de" :placeholder="t('blocks.issuerPlaceholder')" :class="inputClass">
            <AdminMediaPicker v-model="item.mediaId" />
            <button type="button" class="w-fit text-xs text-red-600 underline" @click="removeItem('items', index)">{{ t('blocks.remove') }}</button>
          </div>
          <button
            type="button"
            class="w-fit rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
            @click="addItem('items', { title: { de: '' }, issuer: {}, mediaId: undefined })"
          >
            {{ t('blocks.addItem') }}
          </button>
        </div>
      </AdminFormField>
    </template>

    <p v-if="['damage-wizard', 'partners', 'branch-finder', 'faq-accordion', 'contact-form'].includes(type)" class="text-xs text-slate-500 dark:text-slate-400">
      {{ t('blocks.pullsFromModuleNote') }}
    </p>
  </div>
</template>
