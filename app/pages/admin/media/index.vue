<script setup lang="ts">
import type { MediaItem } from '#shared/types/media'

definePageMeta({ layout: 'admin' })

const toast = useToast()
const { t } = useAdminI18n()
const search = ref('')
const items = ref<MediaItem[]>([])
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const editingItem = ref<MediaItem | null>(null)
const altTextDraft = ref('')
const deleteTarget = ref<MediaItem | null>(null)
const deleteInUseWarning = ref(false)

async function load() {
  loading.value = true
  try {
    items.value = await $fetch<MediaItem[]>('/api/admin/media', { query: { search: search.value || undefined } })
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(search, load)

function thumbUrl(item: MediaItem): string {
  return item.sizes.thumb ?? item.sizes.original ?? Object.values(item.sizes)[0] ?? ''
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

function openEdit(item: MediaItem) {
  editingItem.value = item
  altTextDraft.value = item.altText.de ?? ''
}

async function saveAltText() {
  if (!editingItem.value) return
  try {
    const updated = await $fetch<MediaItem>(`/api/admin/media/${editingItem.value.id}`, {
      method: 'PATCH',
      body: { altText: { ...editingItem.value.altText, de: altTextDraft.value } },
    })
    const index = items.value.findIndex((i) => i.id === updated.id)
    if (index !== -1) items.value[index] = updated
    toast.success(t('common.saved'))
    editingItem.value = null
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.updateFailed')))
  }
}

function openDelete(item: MediaItem) {
  deleteTarget.value = item
  deleteInUseWarning.value = false
}

async function confirmDelete(force = false) {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/media/${deleteTarget.value.id}`, {
      method: 'DELETE',
      query: force ? { force: 'true' } : undefined,
    })
    items.value = items.value.filter((i) => i.id !== deleteTarget.value?.id)
    toast.success(t('common.deleted'))
    deleteTarget.value = null
  } catch (error) {
    const err = error as { statusCode?: number }
    if (err?.statusCode === 409) {
      deleteInUseWarning.value = true
      return
    }
    toast.error(getErrorMessage(error, t('common.deleteFailed')))
    deleteTarget.value = null
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('media.title') }}</h1>
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="search"
          :placeholder="t('media.searchPlaceholder')"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
        <label class="min-h-11 cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
          {{ uploading ? t('common.uploading') : t('common.upload') }}
          <input ref="fileInput" type="file" accept="image/*,.svg" class="hidden" :disabled="uploading" @change="onFileChosen">
        </label>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">{{ t('common.loading') }}</p>
    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="item in items"
        :key="item.id"
        class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="relative aspect-square bg-slate-100 dark:bg-slate-700">
          <img :src="thumbUrl(item)" :alt="item.altText.de || item.originalFileName" class="h-full w-full object-cover">
          <span
            v-if="!item.altText.de"
            class="absolute right-1 top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white"
            :title="t('media.missingAltTextTitle')"
          >
            {{ t('media.noAltTextBadge') }}
          </span>
        </div>
        <div class="p-2">
          <p class="truncate text-xs text-slate-600 dark:text-slate-300" :title="item.originalFileName">
            {{ item.originalFileName }}
          </p>
          <div class="mt-1 flex gap-2 text-xs">
            <button type="button" class="text-primary underline" @click="openEdit(item)">{{ t('media.altText') }}</button>
            <button type="button" class="text-red-600 underline" @click="openDelete(item)">{{ t('common.delete') }}</button>
          </div>
        </div>
      </div>
      <p v-if="!items.length" class="col-span-full py-12 text-center text-slate-400">
        {{ t('media.noMediaYet') }}
      </p>
    </div>

    <AdminModal :open="!!editingItem" :title="t('media.editAltText')" @close="editingItem = null">
      <form class="flex flex-col gap-4" @submit.prevent="saveAltText">
        <AdminFormField :label="t('media.altTextDe')" :hint="t('media.altTextHint')">
          <input
            v-model="altTextDraft"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminModal :open="!!deleteTarget" :title="t('media.deleteMedia')" @close="deleteTarget = null">
      <p v-if="!deleteInUseWarning" class="text-sm text-slate-600 dark:text-slate-300">
        {{ t('media.confirmDelete', { name: deleteTarget?.originalFileName ?? '' }) }}
      </p>
      <p v-else class="text-sm text-amber-600">
        {{ t('media.inUseWarning') }}
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="min-h-11 rounded-md px-4 text-sm" @click="deleteTarget = null">{{ t('common.cancel') }}</button>
        <button
          type="button"
          class="min-h-11 rounded-md bg-red-600 px-4 text-sm font-medium text-white"
          @click="confirmDelete(deleteInUseWarning)"
        >
          {{ deleteInUseWarning ? t('media.deleteAnyway') : t('common.delete') }}
        </button>
      </div>
    </AdminModal>
  </div>
</template>
