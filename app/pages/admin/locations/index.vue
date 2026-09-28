<script setup lang="ts">
import type { DataTableColumn } from '../../../components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

interface LocationRow {
  id: string
  slug: Record<string, string>
  name: Record<string, string>
  address: Record<string, string>
  phone?: string
  email?: string
  latitude?: string
  longitude?: string
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows, refresh } = await useFetch<LocationRow[]>('/api/admin/locations')

const columns = computed<DataTableColumn<LocationRow>[]>(() => [
  { key: 'name', label: t('common.name'), format: (row) => row.name.de ?? '' },
  { key: 'address', label: t('common.address'), format: (row) => row.address.de ?? '' },
  { key: 'phone', label: t('settings.contact.phone'), format: (row) => row.phone ?? '' },
])

const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<LocationRow | null>(null)
const formError = ref('')
const submitting = ref(false)

const form = reactive({
  name: '',
  slug: '',
  address: '',
  phone: '',
  email: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', slug: '', address: '', phone: '', email: '', latitude: undefined, longitude: undefined })
  formError.value = ''
  isFormOpen.value = true
}

function openEdit(row: LocationRow) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name.de ?? '',
    slug: row.slug.de ?? '',
    address: row.address.de ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
  })
  formError.value = ''
  isFormOpen.value = true
}

async function submitForm() {
  formError.value = ''
  submitting.value = true
  const payload = {
    name: { de: form.name },
    slug: { de: form.slug },
    address: { de: form.address },
    phone: form.phone || undefined,
    email: form.email || undefined,
    latitude: form.latitude,
    longitude: form.longitude,
    openingHours: {},
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/locations/${editingId.value}`, { method: 'PATCH', body: payload })
      toast.success(t('locations.branchUpdated'))
    } else {
      await $fetch('/api/admin/locations', { method: 'POST', body: payload })
      toast.success(t('locations.branchCreated'))
    }
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    formError.value = getErrorMessage(error, t('locations.branchSaveFailed'))
  } finally {
    submitting.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/locations/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('locations.branchDeleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('locations.branchDeleteFailed')))
    deleteTarget.value = null
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('locations.title') }}</h1>
      <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('locations.newBranch') }}
      </button>
    </div>

    <AdminDataTable :columns="columns" :rows="rows ?? []" row-key="id">
      <template #cell-phone="{ row }">
        <div class="flex items-center gap-3">
          <span>{{ row.phone }}</span>
          <button type="button" class="text-xs text-primary underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
          <button type="button" class="text-xs text-red-600 underline" @click="deleteTarget = row">{{ t('common.delete') }}</button>
        </div>
      </template>
    </AdminDataTable>

    <AdminModal :open="isFormOpen" :title="editingId ? t('locations.editBranch') : t('locations.newBranch')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('locations.nameDe')">
          <input v-model="form.name" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.slugDe')">
          <input v-model="form.slug" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('locations.addressDe')">
          <input v-model="form.address" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('settings.contact.phone')">
          <input v-model="form.phone" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.email')">
          <input v-model="form.email" type="email" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <div class="grid grid-cols-2 gap-3">
          <AdminFormField :label="t('locations.latitude')">
            <input v-model.number="form.latitude" type="number" step="any" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
          </AdminFormField>
          <AdminFormField :label="t('locations.longitude')">
            <input v-model.number="form.longitude" type="number" step="any" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
          </AdminFormField>
        </div>
        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white disabled:opacity-60" :disabled="submitting">
          {{ submitting ? t('common.saving') : t('common.save') }}
        </button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteTarget"
      :message="t('common.confirmDeleteGeneric', { name: deleteTarget?.name.de ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
