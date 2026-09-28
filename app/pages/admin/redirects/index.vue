<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface RedirectRow {
  id: string
  fromPath: string
  toPath: string
  statusCode: number
}

interface NotFoundLogRow {
  id: string
  path: string
  hitCount: number
  firstSeenAt: string
  lastSeenAt: string
}

const toast = useToast()
const { t } = useAdminI18n()
const tab = ref<'redirects' | 'notFoundLogs'>('redirects')

const { data: rows, refresh } = await useFetch<RedirectRow[]>('/api/admin/redirects')
const { data: notFoundLogs, refresh: refreshLogs } = await useFetch<NotFoundLogRow[]>('/api/admin/not-found-logs')

const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<RedirectRow | null>(null)

const form = reactive({
  fromPath: '',
  toPath: '',
  statusCode: 301 as 301 | 302,
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { fromPath: '', toPath: '', statusCode: 301 })
  isFormOpen.value = true
}

function openEdit(row: RedirectRow) {
  editingId.value = row.id
  Object.assign(form, { fromPath: row.fromPath, toPath: row.toPath, statusCode: row.statusCode })
  isFormOpen.value = true
}

async function submitForm() {
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/redirects/${editingId.value}`, { method: 'PATCH', body: form })
    } else {
      await $fetch('/api/admin/redirects', { method: 'POST', body: form })
    }
    toast.success(t('redirects.redirectSaved'))
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('redirects.redirectSaveFailed')))
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/redirects/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('redirects.redirectDeleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('redirects.redirectDeleteFailed')))
    deleteTarget.value = null
  }
}

// --- 404 logs ---
const redirectTargets = reactive<Record<string, string>>({})

async function createRedirectFromLog(log: NotFoundLogRow) {
  const toPath = redirectTargets[log.id]?.trim()
  if (!toPath) return
  try {
    await $fetch(`/api/admin/not-found-logs/${log.id}/create-redirect`, { method: 'POST', body: { toPath, statusCode: 301 } })
    toast.success(t('redirects.redirectCreatedFromLog'))
    redirectTargets[log.id] = ''
    await Promise.all([refreshLogs(), refresh()])
  } catch (error) {
    toast.error(getErrorMessage(error, t('redirects.redirectSaveFailed')))
  }
}

async function dismissLog(log: NotFoundLogRow) {
  try {
    await $fetch(`/api/admin/not-found-logs/${log.id}`, { method: 'DELETE' })
    await refreshLogs()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.deleteFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('redirects.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ t('redirects.intro') }}
        </p>
      </div>
      <button v-if="tab === 'redirects'" type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('redirects.newRedirect') }}
      </button>
    </div>

    <div class="mb-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'redirects' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'"
        @click="tab = 'redirects'"
      >
        {{ t('redirects.title') }}
      </button>
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'notFoundLogs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'"
        @click="tab = 'notFoundLogs'"
      >
        {{ t('redirects.notFoundLogs') }} <span v-if="notFoundLogs?.length" class="ml-1 rounded-full bg-slate-200 px-1.5 text-xs dark:bg-slate-700">{{ notFoundLogs.length }}</span>
      </button>
    </div>

    <div v-if="tab === 'redirects'" class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2">{{ t('redirects.from') }}</th>
            <th class="px-3 py-2">{{ t('redirects.to') }}</th>
            <th class="px-3 py-2">{{ t('common.status') }}</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <td class="px-3 py-2 font-mono text-xs">{{ row.fromPath }}</td>
            <td class="px-3 py-2 font-mono text-xs">{{ row.toPath }}</td>
            <td class="px-3 py-2">{{ row.statusCode }}</td>
            <td class="px-3 py-2">
              <div class="flex gap-3 text-xs">
                <button type="button" class="text-indigo-600 underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
                <button type="button" class="text-red-600 underline" @click="deleteTarget = row">{{ t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <AdminEmptyState v-if="!rows?.length" :message="t('redirects.noRedirectsYet')" />
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <p class="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        {{ t('redirects.notFoundLogsIntro') }}
      </p>
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2">{{ t('redirects.path') }}</th>
            <th class="px-3 py-2">{{ t('redirects.hitCount') }}</th>
            <th class="px-3 py-2">{{ t('redirects.lastSeen') }}</th>
            <th class="px-3 py-2">{{ t('redirects.to') }}</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in notFoundLogs" :key="log.id" class="border-t border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <td class="px-3 py-2 font-mono text-xs">{{ log.path }}</td>
            <td class="px-3 py-2">{{ log.hitCount }}</td>
            <td class="px-3 py-2 text-xs text-slate-500">{{ new Date(log.lastSeenAt).toLocaleDateString() }}</td>
            <td class="px-3 py-2">
              <input
                v-model="redirectTargets[log.id]"
                placeholder="/new-page"
                class="min-h-9 w-40 rounded-md border border-slate-300 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
            </td>
            <td class="px-3 py-2">
              <div class="flex gap-3 text-xs">
                <button type="button" class="text-indigo-600 underline" @click="createRedirectFromLog(log)">{{ t('redirects.createRedirect') }}</button>
                <button type="button" class="text-red-600 underline" @click="dismissLog(log)">{{ t('redirects.dismiss') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!notFoundLogs?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('redirects.noNotFoundLogsYet') }}</p>
    </div>

    <AdminModal :open="isFormOpen" :title="editingId ? t('redirects.editRedirect') : t('redirects.newRedirect')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('redirects.fromPath')" hint="e.g. /old-page">
          <input v-model="form.fromPath" required placeholder="/old-page" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('redirects.toPath')">
          <input v-model="form.toPath" required placeholder="/new-page" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('redirects.statusCode')">
          <select v-model.number="form.statusCode" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option :value="301">301 ({{ t('redirects.permanent') }})</option>
            <option :value="302">302 ({{ t('redirects.temporary') }})</option>
          </select>
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deleteTarget"
      :message="t('redirects.confirmDeleteFrom', { name: deleteTarget?.fromPath ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
