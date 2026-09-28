<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface SeoValue {
  metaTitle?: string
  metaDescription?: string
  noindex?: boolean
  focusKeyword?: string
  shortAnswer?: string
}

interface ServiceRow {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  shortDescription: Record<string, string>
  content: Record<string, string>
  iconOrMediaId?: string
  isFeatured: boolean
  sortOrder: number
  shortAnswer: Record<string, string>
  priceFromCents: number | null
  durationMinutes: number | null
  warranty: Record<string, string>
  insuranceInfo: Record<string, string>
  seo: Record<string, SeoValue>
}

const toast = useToast()
const { t } = useAdminI18n()
const { data: rows, refresh } = await useFetch<ServiceRow[]>('/api/admin/services')

const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<ServiceRow | null>(null)
const draggingId = ref<string | null>(null)
const formError = ref('')
const submitting = ref(false)

const form = reactive({
  title: '',
  slug: '',
  shortDescription: '',
  content: '',
  iconOrMediaId: undefined as string | undefined,
  isFeatured: false,
  shortAnswer: '',
  priceFromEur: undefined as number | undefined,
  durationMinutes: undefined as number | undefined,
  warranty: '',
  insuranceInfo: '',
  seo: {} as SeoValue,
})

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    title: '',
    slug: '',
    shortDescription: '',
    content: '',
    iconOrMediaId: undefined,
    isFeatured: false,
    shortAnswer: '',
    priceFromEur: undefined,
    durationMinutes: undefined,
    warranty: '',
    insuranceInfo: '',
    seo: {},
  })
  formError.value = ''
  isFormOpen.value = true
}

function openEdit(row: ServiceRow) {
  editingId.value = row.id
  Object.assign(form, {
    title: row.title.de ?? '',
    slug: row.slug.de ?? '',
    shortDescription: row.shortDescription.de ?? '',
    content: row.content.de ?? '',
    iconOrMediaId: row.iconOrMediaId,
    isFeatured: row.isFeatured,
    shortAnswer: row.shortAnswer.de ?? '',
    priceFromEur: row.priceFromCents != null ? row.priceFromCents / 100 : undefined,
    durationMinutes: row.durationMinutes ?? undefined,
    warranty: row.warranty.de ?? '',
    insuranceInfo: row.insuranceInfo.de ?? '',
    seo: { ...(row.seo.de ?? {}) },
  })
  formError.value = ''
  isFormOpen.value = true
}

async function submitForm() {
  formError.value = ''
  submitting.value = true
  const payload = {
    title: { de: form.title },
    slug: { de: form.slug },
    shortDescription: { de: form.shortDescription },
    content: { de: form.content },
    iconOrMediaId: form.iconOrMediaId || undefined,
    isFeatured: form.isFeatured,
    shortAnswer: { de: form.shortAnswer },
    priceFromCents: form.priceFromEur !== undefined ? Math.round(form.priceFromEur * 100) : undefined,
    durationMinutes: form.durationMinutes,
    warranty: { de: form.warranty },
    insuranceInfo: { de: form.insuranceInfo },
    seo: { de: form.seo },
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/services/${editingId.value}`, { method: 'PATCH', body: payload })
      toast.success(t('services.serviceUpdated'))
    } else {
      await $fetch('/api/admin/services', { method: 'POST', body: payload })
      toast.success(t('services.serviceCreated'))
    }
    isFormOpen.value = false
    await refresh()
  } catch (error) {
    formError.value = getErrorMessage(error, t('services.serviceSaveFailed'))
  } finally {
    submitting.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/services/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('services.serviceDeleted'))
    deleteTarget.value = null
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('services.serviceDeleteFailed')))
    deleteTarget.value = null
  }
}

function onDragStart(row: ServiceRow) {
  draggingId.value = row.id
}

async function onDrop(target: ServiceRow) {
  if (!draggingId.value || draggingId.value === target.id || !rows.value) return
  const list = [...rows.value]
  const fromIndex = list.findIndex((r) => r.id === draggingId.value)
  const toIndex = list.findIndex((r) => r.id === target.id)
  const [moved] = list.splice(fromIndex, 1)
  if (moved) list.splice(toIndex, 0, moved)
  draggingId.value = null

  try {
    await $fetch('/api/admin/services/reorder', { method: 'PUT', body: list.map((r) => r.id) })
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.reorderFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('services.title') }}</h1>
      <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('services.newService') }}
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
          <span class="font-medium">{{ row.title.de }}</span>
          <span class="text-xs text-slate-400">/{{ row.slug.de }}</span>
          <span v-if="row.isFeatured" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{{ t('common.featured') }}</span>
        </div>
        <div class="flex gap-3 text-xs">
          <button type="button" class="text-indigo-600 underline" @click="openEdit(row)">{{ t('common.edit') }}</button>
          <button type="button" class="text-red-600 underline" @click="deleteTarget = row">{{ t('common.delete') }}</button>
        </div>
      </div>
      <p v-if="!rows?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('services.noServicesYet') }}</p>
    </div>

    <AdminModal :open="isFormOpen" :title="editingId ? t('services.editService') : t('services.newService')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('common.titleDe')">
          <input v-model="form.title" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.slugDe')">
          <input v-model="form.slug" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.shortDescriptionDe')">
          <input v-model="form.shortDescription" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.contentDe')">
          <AdminRichTextEditor v-model="form.content" />
        </AdminFormField>
        <AdminFormField :label="t('common.iconImage')">
          <AdminMediaPicker v-model="form.iconOrMediaId" />
        </AdminFormField>
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input v-model="form.isFeatured" type="checkbox">
          {{ t('common.featured') }}
        </label>

        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('services.factsSection') }}</h3>
        <AdminFormField :label="t('services.shortAnswerDe')">
          <textarea v-model="form.shortAnswer" rows="2" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
        </AdminFormField>
        <AdminFormField :label="t('services.priceFromEur')" :hint="t('services.priceFromHint')">
          <input v-model.number="form.priceFromEur" type="number" min="0" step="0.01" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('services.durationMinutes')">
          <input v-model.number="form.durationMinutes" type="number" min="0" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('services.warrantyDe')">
          <input v-model="form.warranty" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('services.insuranceInfoDe')">
          <input v-model="form.insuranceInfo" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>

        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('services.seoSection') }}</h3>
        <AdminSeoPanel v-model="form.seo" :title-fallback="form.title" :url="`/services/${form.slug}`" />

        <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60" :disabled="submitting">
          {{ submitting ? t('common.saving') : t('common.save') }}
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
