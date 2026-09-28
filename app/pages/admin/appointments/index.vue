<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface AppointmentRow {
  id: string
  formData: Record<string, unknown>
  contactName: string
  contactEmail: string
  contactPhone?: string
  locale: string
  status: 'new' | 'contacted' | 'scheduled' | 'done' | 'cancelled'
  adminNotes?: string
  createdAt: string
}

interface MessageRow {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  locale: string
  isRead: boolean
  createdAt: string
}

const toast = useToast()
const { t } = useAdminI18n()
const tab = ref<'appointments' | 'messages'>('appointments')
const statusFilter = ref<string>('all')

const { data: appointments, refresh: refreshAppointments } = await useFetch<AppointmentRow[]>('/api/admin/appointments')
const { data: messages, refresh: refreshMessages } = await useFetch<MessageRow[]>('/api/admin/contact-messages')

const filteredAppointments = computed(() => {
  if (statusFilter.value === 'all') return appointments.value ?? []
  return (appointments.value ?? []).filter((a) => a.status === statusFilter.value)
})

const editingAppointment = ref<AppointmentRow | null>(null)
const notesDraft = ref('')

function openAppointment(row: AppointmentRow) {
  editingAppointment.value = row
  notesDraft.value = row.adminNotes ?? ''
}

async function updateStatus(row: AppointmentRow, status: AppointmentRow['status']) {
  try {
    await $fetch(`/api/admin/appointments/${row.id}`, { method: 'PATCH', body: { status } })
    toast.success(t('appointments.statusUpdated'))
    await refreshAppointments()
  } catch (error) {
    toast.error(getErrorMessage(error, t('appointments.statusUpdateFailed')))
  }
}

async function saveNotes() {
  if (!editingAppointment.value) return
  try {
    await $fetch(`/api/admin/appointments/${editingAppointment.value.id}`, {
      method: 'PATCH',
      body: { adminNotes: notesDraft.value },
    })
    toast.success(t('appointments.notesSaved'))
    editingAppointment.value = null
    await refreshAppointments()
  } catch (error) {
    toast.error(getErrorMessage(error, t('appointments.notesSaveFailed')))
  }
}

async function toggleRead(row: MessageRow) {
  try {
    await $fetch(`/api/admin/contact-messages/${row.id}`, { method: 'PATCH', body: { isRead: !row.isRead } })
    await refreshMessages()
  } catch (error) {
    toast.error(getErrorMessage(error, t('appointments.messageUpdateFailed')))
  }
}

async function deleteMessage(row: MessageRow) {
  try {
    await $fetch(`/api/admin/contact-messages/${row.id}`, { method: 'DELETE' })
    toast.success(t('appointments.messageDeleted'))
    await refreshMessages()
  } catch (error) {
    toast.error(getErrorMessage(error, t('appointments.messageDeleteFailed')))
  }
}

function downloadCsv() {
  window.open('/api/admin/appointments/export', '_blank')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('appointments.title') }}</h1>

    <div class="mb-4 mt-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        @click="tab = 'appointments'"
      >
        {{ t('appointments.appointmentsTab') }}
      </button>
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        @click="tab = 'messages'"
      >
        {{ t('appointments.messagesTab') }}
      </button>
    </div>

    <div v-if="tab === 'appointments'">
      <div class="mb-4 flex items-center justify-between">
        <select
          v-model="statusFilter"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="all">{{ t('appointments.allStatuses') }}</option>
          <option value="new">{{ t('appointments.statusNew') }}</option>
          <option value="contacted">{{ t('appointments.statusContacted') }}</option>
          <option value="scheduled">{{ t('appointments.statusScheduled') }}</option>
          <option value="done">{{ t('appointments.statusDone') }}</option>
          <option value="cancelled">{{ t('appointments.statusCancelled') }}</option>
        </select>
        <button type="button" class="min-h-11 rounded-md border border-slate-300 px-4 text-sm dark:border-slate-600" @click="downloadCsv">
          {{ t('appointments.exportCsv') }}
        </button>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
        <div
          v-for="row in filteredAppointments"
          :key="row.id"
          class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
        >
          <div class="text-sm text-slate-700 dark:text-slate-200">
            <p class="font-medium">{{ row.contactName }} &middot; {{ row.contactEmail }}</p>
            <p class="text-xs text-slate-400">{{ new Date(row.createdAt).toLocaleString() }} &middot; {{ row.locale }}</p>
          </div>
          <div class="flex items-center gap-3">
            <select
              :value="row.status"
              class="min-h-11 rounded-md border border-slate-300 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              @change="updateStatus(row, ($event.target as HTMLSelectElement).value as AppointmentRow['status'])"
            >
              <option value="new">{{ t('appointments.statusNew') }}</option>
              <option value="contacted">{{ t('appointments.statusContacted') }}</option>
              <option value="scheduled">{{ t('appointments.statusScheduled') }}</option>
              <option value="done">{{ t('appointments.statusDone') }}</option>
              <option value="cancelled">{{ t('appointments.statusCancelled') }}</option>
            </select>
            <button type="button" class="text-xs text-primary underline" @click="openAppointment(row)">{{ t('appointments.detailsNotes') }}</button>
          </div>
        </div>
        <p v-if="!filteredAppointments.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('appointments.noAppointments') }}</p>
      </div>
    </div>

    <div v-else>
      <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
        <div
          v-for="row in messages"
          :key="row.id"
          class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
          :class="!row.isRead && 'bg-blue-50 dark:bg-slate-700'"
        >
          <div class="text-sm text-slate-700 dark:text-slate-200">
            <p class="font-medium">{{ row.name }} &middot; {{ row.email }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ row.message }}</p>
            <p class="mt-1 text-xs text-slate-400">{{ new Date(row.createdAt).toLocaleString() }}</p>
          </div>
          <div class="flex gap-3 text-xs">
            <button type="button" class="text-primary underline" @click="toggleRead(row)">
              {{ row.isRead ? t('appointments.markUnread') : t('appointments.markRead') }}
            </button>
            <button type="button" class="text-red-600 underline" @click="deleteMessage(row)">{{ t('common.delete') }}</button>
          </div>
        </div>
        <p v-if="!messages?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('appointments.noMessages') }}</p>
      </div>
    </div>

    <AdminModal :open="!!editingAppointment" :title="t('appointments.appointmentDetails')" @close="editingAppointment = null">
      <div v-if="editingAppointment" class="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-200">
        <p><strong>{{ t('appointments.name') }}:</strong> {{ editingAppointment.contactName }}</p>
        <p><strong>{{ t('appointments.email') }}:</strong> {{ editingAppointment.contactEmail }}</p>
        <p v-if="editingAppointment.contactPhone"><strong>{{ t('appointments.phone') }}:</strong> {{ editingAppointment.contactPhone }}</p>
        <pre class="whitespace-pre-wrap rounded-md bg-slate-100 p-3 text-xs dark:bg-slate-900">{{ JSON.stringify(editingAppointment.formData, null, 2) }}</pre>
        <AdminFormField :label="t('appointments.adminNotes')">
          <textarea
            v-model="notesDraft"
            rows="4"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </AdminFormField>
        <button type="button" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white" @click="saveNotes">
          {{ t('appointments.saveNotes') }}
        </button>
      </div>
    </AdminModal>
  </div>
</template>
