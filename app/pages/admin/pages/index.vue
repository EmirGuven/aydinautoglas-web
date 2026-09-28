<script setup lang="ts">
import type { DataTableColumn } from '../../../components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

interface PageRow {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  status: 'draft' | 'published'
  isSystemPage: boolean
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows, refresh } = await useFetch<PageRow[]>('/api/admin/pages')

const columns = computed<DataTableColumn<PageRow>[]>(() => [
  { key: 'title', label: t('common.name'), format: (row) => row.title.de ?? '' },
  { key: 'slug', label: t('common.slugDe'), format: (row) => `/${row.slug.de ?? ''}` },
  { key: 'status', label: t('common.status') },
])

const isCreateOpen = ref(false)
const formError = ref('')
const submitting = ref(false)
const form = reactive({ title: '', slug: '' })
const deleteTarget = ref<PageRow | null>(null)

function openCreate() {
  form.title = ''
  form.slug = ''
  formError.value = ''
  isCreateOpen.value = true
}

async function submitCreate() {
  formError.value = ''
  submitting.value = true
  try {
    const created = await $fetch<PageRow>('/api/admin/pages', {
      method: 'POST',
      body: { title: { de: form.title }, slug: { de: form.slug } },
    })
    isCreateOpen.value = false
    await refresh()
    await navigateTo(`/admin/pages/${created.id}`)
  } catch (error) {
    formError.value = getErrorMessage(error, t('common.createFailed'))
  } finally {
    submitting.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/pages/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('common.deleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.deleteFailed')))
    deleteTarget.value = null
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('nav.pages') }}</h1>
      <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('common.new') }}
      </button>
    </div>

    <AdminDataTable :columns="columns" :rows="rows ?? []" row-key="id">
      <template #cell-status="{ row }">
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="row.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
        >
          {{ row.status }}
        </span>
      </template>
      <template #cell-slug="{ row }">
        <div class="flex items-center gap-3">
          <span>/{{ row.slug.de }}</span>
          <NuxtLink :to="`/admin/pages/${row.id}`" class="text-xs text-indigo-600 underline">{{ t('common.edit') }}</NuxtLink>
          <button
            v-if="!row.isSystemPage"
            type="button"
            class="text-xs text-red-600 underline"
            @click="deleteTarget = row"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </template>
    </AdminDataTable>

    <AdminModal :open="isCreateOpen" :title="t('common.new')" @close="isCreateOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitCreate">
        <AdminFormField :label="t('common.titleDe')">
          <input v-model="form.title" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.slugDe')" hint="e.g. ueber-uns (leave empty for the homepage)">
          <input v-model="form.slug" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60" :disabled="submitting">
          {{ submitting ? t('common.creating') : t('common.create') }}
        </button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteTarget"
      :message="t('common.confirmDeleteGeneric', { name: deleteTarget?.title.de ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
