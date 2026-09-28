<script setup lang="ts">
import type { MediaItem } from '#shared/types/media'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [id: string | undefined] }>()

const toast = useToast()
const { t } = useAdminI18n()
const isOpen = ref(false)
const items = ref<MediaItem[]>([])
const loading = ref(false)
const search = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const selectedItem = computed(() => items.value.find((item) => item.id === props.modelValue))

function thumbUrl(item: MediaItem): string {
  return item.sizes.thumb ?? item.sizes.original ?? Object.values(item.sizes)[0] ?? ''
}

async function loadItems() {
  loading.value = true
  try {
    items.value = await $fetch<MediaItem[]>('/api/admin/media', { query: { search: search.value || undefined } })
  } finally {
    loading.value = false
  }
}

function open() {
  isOpen.value = true
  loadItems()
}

function select(item: MediaItem) {
  emit('update:modelValue', item.id)
  isOpen.value = false
}

function clear() {
  emit('update:modelValue', undefined)
}

async function onFileChosen(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const created = await $fetch<MediaItem>('/api/admin/media', { method: 'POST', body: formData })
    items.value.unshift(created)
    toast.success(t('media.uploaded'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('media.uploadFailed')))
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

watch(search, () => loadItems())

watch(
  () => props.modelValue,
  (id) => {
    if (id && !items.value.length) loadItems()
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <div
        v-if="selectedItem"
        class="h-16 w-16 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
      >
        <img :src="thumbUrl(selectedItem)" :alt="selectedItem.originalFileName" class="h-full w-full object-cover">
      </div>
      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-600"
          @click="open"
        >
          {{ selectedItem ? t('media.changeImage') : t('media.chooseImage') }}
        </button>
        <button
          v-if="selectedItem"
          type="button"
          class="text-xs text-red-600 underline"
          @click="clear"
        >
          {{ t('media.remove') }}
        </button>
      </div>
    </div>

    <AdminModal :open="isOpen" :title="t('media.library')" @close="isOpen = false">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <input
            v-model="search"
            type="search"
            :placeholder="t('common.search')"
            class="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
          <label
            class="min-h-11 cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-medium text-white"
          >
            {{ uploading ? t('common.uploading') : t('common.upload') }}
            <input ref="fileInput" type="file" accept="image/*,.svg" class="hidden" :disabled="uploading" @change="onFileChosen">
          </label>
        </div>

        <p v-if="loading" class="text-sm text-slate-500">{{ t('common.loading') }}</p>
        <div v-else class="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-primary dark:border-slate-600 dark:bg-slate-700"
            :title="item.originalFileName"
            @click="select(item)"
          >
            <img :src="thumbUrl(item)" :alt="item.originalFileName" class="h-full w-full object-cover">
          </button>
          <p v-if="!items.length" class="col-span-full py-6 text-center text-sm text-slate-400">
            {{ t('media.noMediaYet') }}
          </p>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
