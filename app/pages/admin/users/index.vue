<script setup lang="ts">
import type { DataTableColumn } from '../../../components/admin/DataTable.vue'
import type { UserRole } from '#shared/schemas/users'

definePageMeta({ layout: 'admin' })

interface AdminUserRow {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

const toast = useToast()
const { t } = useAdminI18n()

const { data: userList, refresh, error: listError } = await useFetch<AdminUserRow[]>('/api/admin/users')
const listErrorMessage = computed(() => (listError.value ? getErrorMessage(listError.value, t('users.loadFailed')) : ''))

const columns = computed<DataTableColumn<AdminUserRow>[]>(() => [
  { key: 'name', label: t('common.name'), sortable: true },
  { key: 'email', label: t('common.email'), sortable: true },
  { key: 'role', label: t('users.role'), sortable: true },
  { key: 'isActive', label: t('users.active'), format: (row) => (row.isActive ? t('users.yes') : t('users.no')) },
])

const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const editingUser = ref<AdminUserRow | null>(null)
const deletingUser = ref<AdminUserRow | null>(null)
const formError = ref('')
const submitting = ref(false)

const form = reactive({ email: '', name: '', password: '', role: 'editor' as UserRole })

function openCreate() {
  form.email = ''
  form.name = ''
  form.password = ''
  form.role = 'editor'
  formError.value = ''
  isCreateOpen.value = true
}

async function submitCreate() {
  formError.value = ''
  submitting.value = true
  try {
    await $fetch('/api/admin/users', { method: 'POST', body: form })
    toast.success(t('users.userCreated'))
    isCreateOpen.value = false
    await refresh()
  } catch (error) {
    formError.value = getErrorMessage(error, t('users.userCreateFailed'))
  } finally {
    submitting.value = false
  }
}

function openEdit(row: AdminUserRow) {
  editingUser.value = row
  form.name = row.name
  form.role = row.role
  form.password = ''
  formError.value = ''
  isEditOpen.value = true
}

async function submitEdit() {
  if (!editingUser.value) return
  formError.value = ''
  submitting.value = true
  try {
    const payload: Record<string, unknown> = { name: form.name, role: form.role }
    if (form.password) payload.password = form.password
    await $fetch(`/api/admin/users/${editingUser.value.id}`, { method: 'PATCH', body: payload })
    toast.success(t('users.userUpdated'))
    isEditOpen.value = false
    await refresh()
  } catch (error) {
    formError.value = getErrorMessage(error, t('users.userUpdateFailed'))
  } finally {
    submitting.value = false
  }
}

function openDelete(row: AdminUserRow) {
  deletingUser.value = row
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingUser.value) return
  try {
    await $fetch(`/api/admin/users/${deletingUser.value.id}`, { method: 'DELETE' })
    toast.success(t('users.userDeleted'))
    isDeleteOpen.value = false
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('users.userDeleteFailed')))
    isDeleteOpen.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('users.title') }}</h1>
      <button
        type="button"
        class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white"
        @click="openCreate"
      >
        {{ t('users.newUser') }}
      </button>
    </div>

    <p v-if="listError" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
      {{ listErrorMessage }}
    </p>

    <AdminDataTable
      v-else
      :columns="columns"
      :rows="userList ?? []"
      row-key="id"
    >
      <template #cell-role="{ row }">
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-700">
          {{ row.role }}
        </span>
      </template>
      <template #cell-isActive="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.isActive ? t('users.yes') : t('users.no') }}</span>
          <button type="button" class="text-xs text-indigo-600 underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
          <button type="button" class="text-xs text-red-600 underline" @click="openDelete(row)">{{ t('common.delete') }}</button>
        </div>
      </template>
    </AdminDataTable>

    <AdminModal :open="isCreateOpen" :title="t('users.newUser')" @close="isCreateOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitCreate">
        <AdminFormField :label="t('common.name')">
          <input v-model="form.name" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.email')">
          <input v-model="form.email" type="email" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.password')" :hint="t('users.passwordHint')">
          <input v-model="form.password" type="password" required minlength="10" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('users.role')" :error="formError">
          <select v-model="form.role" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option value="editor">{{ t('users.roleEditor') }}</option>
            <option value="admin">{{ t('users.roleAdmin') }}</option>
            <option value="owner">{{ t('users.roleOwner') }}</option>
          </select>
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60" :disabled="submitting">
          {{ submitting ? t('common.creating') : t('users.createUser') }}
        </button>
      </form>
    </AdminModal>

    <AdminModal :open="isEditOpen" :title="t('users.editUser')" @close="isEditOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitEdit">
        <AdminFormField :label="t('common.name')">
          <input v-model="form.name" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('users.role')" :error="formError">
          <select v-model="form.role" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option value="editor">{{ t('users.roleEditor') }}</option>
            <option value="admin">{{ t('users.roleAdmin') }}</option>
            <option value="owner">{{ t('users.roleOwner') }}</option>
          </select>
        </AdminFormField>
        <AdminFormField :label="t('users.newPassword')" :hint="t('users.newPasswordHint')">
          <input v-model="form.password" type="password" minlength="10" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60" :disabled="submitting">
          {{ submitting ? t('common.saving') : t('common.save') }}
        </button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="isDeleteOpen"
      :title="t('users.deleteUser')"
      :message="t('users.confirmDeleteUser', { name: deletingUser?.name ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="isDeleteOpen = false"
    />
  </div>
</template>
