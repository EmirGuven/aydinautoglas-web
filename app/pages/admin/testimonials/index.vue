<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface TestimonialRow {
  id: string
  authorName: string
  authorPhotoMediaId?: string
  rating: number
  text: Record<string, string>
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows, refresh } = await useFetch<TestimonialRow[]>('/api/admin/testimonials')

const draggingId = ref<string | null>(null)
const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<TestimonialRow | null>(null)

const form = reactive({
  authorName: '',
  authorPhotoMediaId: undefined as string | undefined,
  rating: 5,
  text: '',
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { authorName: '', authorPhotoMediaId: undefined, rating: 5, text: '' })
  isFormOpen.value = true
}

function openEdit(row: TestimonialRow) {
  editingId.value = row.id
  Object.assign(form, {
    authorName: row.authorName,
    authorPhotoMediaId: row.authorPhotoMediaId,
    rating: row.rating,
    text: row.text.de ?? '',
  })
  isFormOpen.value = true
}

async function submitForm() {
  const payload = {
    authorName: form.authorName,
    authorPhotoMediaId: form.authorPhotoMediaId || undefined,
    rating: form.rating,
    text: { de: form.text },
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/testimonials/${editingId.value}`, { method: 'PATCH', body: payload })
    } else {
      await $fetch('/api/admin/testimonials', { method: 'POST', body: payload })
    }
    toast.success(t('testimonials.testimonialSaved'))
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('testimonials.testimonialSaveFailed')))
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/testimonials/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('testimonials.testimonialDeleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('testimonials.testimonialDeleteFailed')))
    deleteTarget.value = null
  }
}

function onDragStart(row: TestimonialRow) {
  draggingId.value = row.id
}

async function onDrop(target: TestimonialRow) {
  if (!draggingId.value || draggingId.value === target.id || !rows.value) return
  const list = [...rows.value]
  const fromIndex = list.findIndex((r) => r.id === draggingId.value)
  const toIndex = list.findIndex((r) => r.id === target.id)
  const [moved] = list.splice(fromIndex, 1)
  if (moved) list.splice(toIndex, 0, moved)
  draggingId.value = null
  try {
    await $fetch('/api/admin/testimonials/reorder', { method: 'PUT', body: list.map((r) => r.id) })
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.reorderFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('testimonials.title') }}</h1>
      <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('testimonials.newTestimonial') }}
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <div
        v-for="row in rows"
        :key="row.id"
        draggable="true"
        class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
        @dragstart="onDragStart(row)"
        @dragover.prevent
        @drop="onDrop(row)"
      >
        <div class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span class="cursor-move text-slate-400">&#10087;</span>
          <span class="font-medium">{{ row.authorName }}</span>
          <span class="text-xs text-amber-500">{{ '★'.repeat(row.rating) }}</span>
        </div>
        <div class="flex gap-3 text-xs">
          <button type="button" class="text-indigo-600 underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
          <button type="button" class="text-red-600 underline" @click="deleteTarget = row">{{ t('common.delete') }}</button>
        </div>
      </div>
      <AdminEmptyState v-if="!rows?.length" :message="t('testimonials.noTestimonialsYet')" />
    </div>

    <AdminModal :open="isFormOpen" :title="editingId ? t('testimonials.editTestimonial') : t('testimonials.newTestimonial')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('testimonials.authorName')">
          <input v-model="form.authorName" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('testimonials.photo')">
          <AdminMediaPicker v-model="form.authorPhotoMediaId" />
        </AdminFormField>
        <AdminFormField :label="t('testimonials.rating')">
          <select v-model.number="form.rating" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option v-for="n in [1, 2, 3, 4, 5]" :key="n" :value="n">{{ n }}</option>
          </select>
        </AdminFormField>
        <AdminFormField :label="t('testimonials.textDe')">
          <textarea v-model="form.text" required rows="3" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteTarget"
      :message="t('common.confirmDeleteGeneric', { name: deleteTarget?.authorName ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
