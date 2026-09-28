<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface PartnerRow {
  id: string
  name: string
  logoMediaId: string
  websiteUrl?: string
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows, refresh } = await useFetch<PartnerRow[]>('/api/admin/partners')

const draggingId = ref<string | null>(null)
const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<PartnerRow | null>(null)
const formError = ref('')

const form = reactive({
  name: '',
  logoMediaId: undefined as string | undefined,
  websiteUrl: '',
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', logoMediaId: undefined, websiteUrl: '' })
  formError.value = ''
  isFormOpen.value = true
}

function openEdit(row: PartnerRow) {
  editingId.value = row.id
  Object.assign(form, { name: row.name, logoMediaId: row.logoMediaId, websiteUrl: row.websiteUrl ?? '' })
  formError.value = ''
  isFormOpen.value = true
}

async function submitForm() {
  formError.value = ''
  if (!form.logoMediaId) {
    formError.value = t('partners.logoRequired')
    return
  }
  const payload = { name: form.name, logoMediaId: form.logoMediaId, websiteUrl: form.websiteUrl || undefined }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/partners/${editingId.value}`, { method: 'PATCH', body: payload })
    } else {
      await $fetch('/api/admin/partners', { method: 'POST', body: payload })
    }
    toast.success(t('partners.partnerSaved'))
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    formError.value = getErrorMessage(error, t('partners.partnerSaveFailed'))
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/partners/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('partners.partnerDeleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('partners.partnerDeleteFailed')))
    deleteTarget.value = null
  }
}

function onDragStart(row: PartnerRow) {
  draggingId.value = row.id
}

async function onDrop(target: PartnerRow) {
  if (!draggingId.value || draggingId.value === target.id || !rows.value) return
  const list = [...rows.value]
  const fromIndex = list.findIndex((r) => r.id === draggingId.value)
  const toIndex = list.findIndex((r) => r.id === target.id)
  const [moved] = list.splice(fromIndex, 1)
  if (moved) list.splice(toIndex, 0, moved)
  draggingId.value = null
  try {
    await $fetch('/api/admin/partners/reorder', { method: 'PUT', body: list.map((r) => r.id) })
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.reorderFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('partners.title') }}</h1>
      <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('partners.newPartner') }}
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
          <span class="font-medium">{{ row.name }}</span>
        </div>
        <div class="flex gap-3 text-xs">
          <button type="button" class="text-primary underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
          <button type="button" class="text-red-600 underline" @click="deleteTarget = row">{{ t('common.delete') }}</button>
        </div>
      </div>
      <p v-if="!rows?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('partners.noPartnersYet') }}</p>
    </div>

    <AdminModal :open="isFormOpen" :title="editingId ? t('partners.editPartner') : t('partners.newPartner')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('common.name')">
          <input v-model="form.name" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('settings.general.logo')">
          <AdminMediaPicker v-model="form.logoMediaId" />
        </AdminFormField>
        <AdminFormField :label="t('partners.websiteUrl')">
          <input v-model="form.websiteUrl" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteTarget"
      :message="t('common.confirmDeleteGeneric', { name: deleteTarget?.name ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
