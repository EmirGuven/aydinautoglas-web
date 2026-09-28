<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface CategoryRow {
  id: string
  name: Record<string, string>
}

interface FaqRow {
  id: string
  categoryId?: string
  question: Record<string, string>
  answer: Record<string, string>
  sortOrder: number
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: categories, refresh: refreshCategories } = await useFetch<CategoryRow[]>('/api/admin/faqs/categories')
const { data: faqs, refresh: refreshFaqs } = await useFetch<FaqRow[]>('/api/admin/faqs')

const draggingId = ref<string | null>(null)
const isFaqFormOpen = ref(false)
const editingFaqId = ref<string | null>(null)
const deleteFaqTarget = ref<FaqRow | null>(null)
const faqForm = reactive({ categoryId: '' as string | '', question: '', answer: '' })

const isCategoryFormOpen = ref(false)
const categoryName = ref('')

function categoryNameFor(id?: string): string {
  return categories.value?.find((c) => c.id === id)?.name.de ?? '—'
}

function openCreateFaq() {
  editingFaqId.value = null
  Object.assign(faqForm, { categoryId: '', question: '', answer: '' })
  isFaqFormOpen.value = true
}

function openEditFaq(row: FaqRow) {
  editingFaqId.value = row.id
  Object.assign(faqForm, { categoryId: row.categoryId ?? '', question: row.question.de ?? '', answer: row.answer.de ?? '' })
  isFaqFormOpen.value = true
}

async function submitFaq() {
  const payload = {
    categoryId: faqForm.categoryId || undefined,
    question: { de: faqForm.question },
    answer: { de: faqForm.answer },
  }
  try {
    if (editingFaqId.value) {
      await $fetch(`/api/admin/faqs/${editingFaqId.value}`, { method: 'PATCH', body: payload })
    } else {
      await $fetch('/api/admin/faqs', { method: 'POST', body: payload })
    }
    toast.success(t('faqs.faqSaved'))
    isFaqFormOpen.value = false
    await refreshFaqs()
  } catch (error) {
    toast.error(getErrorMessage(error, t('faqs.faqSaveFailed')))
  }
}

async function confirmDeleteFaq() {
  if (!deleteFaqTarget.value) return
  try {
    await $fetch(`/api/admin/faqs/${deleteFaqTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('faqs.faqDeleted'))
    deleteFaqTarget.value = null
    await refreshFaqs()
  } catch (error) {
    toast.error(getErrorMessage(error, t('faqs.faqDeleteFailed')))
    deleteFaqTarget.value = null
  }
}

function onDragStart(row: FaqRow) {
  draggingId.value = row.id
}

async function onDrop(target: FaqRow) {
  if (!draggingId.value || draggingId.value === target.id || !faqs.value) return
  const list = [...faqs.value]
  const fromIndex = list.findIndex((r) => r.id === draggingId.value)
  const toIndex = list.findIndex((r) => r.id === target.id)
  const [moved] = list.splice(fromIndex, 1)
  if (moved) list.splice(toIndex, 0, moved)
  draggingId.value = null
  try {
    await $fetch('/api/admin/faqs/reorder', { method: 'PUT', body: list.map((r) => r.id) })
    await refreshFaqs()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.reorderFailed')))
  }
}

async function submitCategory() {
  try {
    await $fetch('/api/admin/faqs/categories', { method: 'POST', body: { name: { de: categoryName.value } } })
    toast.success(t('faqs.categoryAdded'))
    categoryName.value = ''
    isCategoryFormOpen.value = false
    await refreshCategories()
  } catch (error) {
    toast.error(getErrorMessage(error, t('faqs.categoryAddFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('faqs.title') }}</h1>
      <div class="flex gap-2">
        <button type="button" class="min-h-11 rounded-md border border-slate-300 px-4 text-sm dark:border-slate-600" @click="isCategoryFormOpen = true">
          {{ t('faqs.newCategory') }}
        </button>
        <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreateFaq">
          {{ t('faqs.newFaq') }}
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <div
        v-for="row in faqs"
        :key="row.id"
        draggable="true"
        class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
        @dragstart="onDragStart(row)"
        @dragover.prevent
        @drop="onDrop(row)"
      >
        <div class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span class="cursor-move text-slate-400">&#10087;</span>
          <span class="font-medium">{{ row.question.de }}</span>
          <span class="text-xs text-slate-400">({{ categoryNameFor(row.categoryId) }})</span>
        </div>
        <div class="flex gap-3 text-xs">
          <button type="button" class="text-primary underline" @click="openEditFaq(row)">{{ t('common.edit') }}</button>
          <button type="button" class="text-red-600 underline" @click="deleteFaqTarget = row">{{ t('common.delete') }}</button>
        </div>
      </div>
      <p v-if="!faqs?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('faqs.noFaqsYet') }}</p>
    </div>

    <AdminModal :open="isFaqFormOpen" :title="editingFaqId ? t('faqs.editFaq') : t('faqs.newFaq')" @close="isFaqFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitFaq">
        <AdminFormField :label="t('faqs.category')">
          <select v-model="faqForm.categoryId" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option value="">{{ t('faqs.none') }}</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name.de }}</option>
          </select>
        </AdminFormField>
        <AdminFormField :label="t('faqs.questionDe')">
          <input v-model="faqForm.question" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('faqs.answerDe')">
          <textarea v-model="faqForm.answer" required rows="3" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminModal :open="isCategoryFormOpen" :title="t('faqs.newCategory')" @close="isCategoryFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitCategory">
        <AdminFormField :label="t('locations.nameDe')">
          <input v-model="categoryName" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">{{ t('faqs.add') }}</button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteFaqTarget"
      :message="t('common.confirmDeleteGeneric', { name: deleteFaqTarget?.question.de ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDeleteFaq"
      @cancel="deleteFaqTarget = null"
    />
  </div>
</template>
