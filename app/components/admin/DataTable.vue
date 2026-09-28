<script setup lang="ts" generic="T extends object">
import { ChevronDown, ChevronUp } from '@lucide/vue'

export interface DataTableColumn<T> {
  key: keyof T & string
  label: string
  sortable?: boolean
  format?: (row: T) => string
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn<T>[]
    rows: T[]
    rowKey: keyof T & string
    searchable?: boolean
    pageSize?: number
    selectable?: boolean
  }>(),
  { searchable: true, pageSize: 10, selectable: false },
)

const emit = defineEmits<{ selectionChange: [ids: Array<T[keyof T]>] }>()
const { t } = useAdminI18n()

const search = ref('')
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const selected = shallowRef(new Set<T[keyof T]>())

const filtered = computed(() => {
  if (!props.searchable || !search.value.trim()) return props.rows
  const term = search.value.toLowerCase()
  return props.rows.filter((row) =>
    props.columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(term)),
  )
})

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value
  const key = sortKey.value
  return [...filtered.value].sort((a, b) => {
    const av = a[key as keyof T]
    const bv = b[key as keyof T]
    if (av === bv) return 0
    const result = av! > bv! ? 1 : -1
    return sortDir.value === 'asc' ? result : -result
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sorted.value.slice(start, start + props.pageSize)
})

watch([search, () => props.rows], () => {
  page.value = 1
})

function toggleSort(key: string, sortable?: boolean) {
  if (!sortable) return
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function toggleSelect(row: T) {
  const id = row[props.rowKey]
  if (selected.value.has(id)) {
    selected.value.delete(id)
  } else {
    selected.value.add(id)
  }
  triggerRef(selected)
  emit('selectionChange', [...selected.value])
}

function cellValue(row: T, column: DataTableColumn<T>): string {
  return column.format ? column.format(row) : String(row[column.key] ?? '')
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div v-if="searchable" class="border-b border-slate-200 p-3 dark:border-slate-700">
      <input
        v-model="search"
        type="search"
        :placeholder="t('common.search')"
        class="min-h-11 w-full max-w-xs rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th v-if="selectable" class="w-10 px-4 py-3" />
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 font-medium"
              :class="col.sortable && 'cursor-pointer select-none'"
              @click="toggleSort(col.key, col.sortable)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="h-3.5 w-3.5" />
                <ChevronDown v-else-if="sortKey === col.key" class="h-3.5 w-3.5" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in paginated"
            :key="String(row[rowKey])"
            class="border-t border-slate-100 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/40"
          >
            <td v-if="selectable" class="px-4 py-3">
              <input type="checkbox" :checked="selected.has(row[rowKey])" @change="toggleSelect(row)">
            </td>
            <td v-for="col in columns" :key="col.key" class="px-4 py-3">
              <slot :name="`cell-${col.key}`" :row="row">{{ cellValue(row, col) }}</slot>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              {{ t('dataTable.noResults') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-200 p-3 text-sm dark:border-slate-700">
      <button
        type="button"
        class="min-h-11 rounded-md border border-slate-200 px-3 disabled:opacity-40 dark:border-slate-600"
        :disabled="page === 1"
        @click="page--"
      >
        {{ t('dataTable.previous') }}
      </button>
      <span>{{ t('dataTable.pageOf', { page, total: totalPages }) }}</span>
      <button
        type="button"
        class="min-h-11 rounded-md border border-slate-200 px-3 disabled:opacity-40 dark:border-slate-600"
        :disabled="page === totalPages"
        @click="page++"
      >
        {{ t('dataTable.next') }}
      </button>
    </div>
  </div>
</template>
