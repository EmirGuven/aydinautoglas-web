<script setup lang="ts">
import { BLOCK_TYPES, defaultBlockData, type BlockType } from '#shared/schemas/blocks'

definePageMeta({ layout: 'admin' })

interface BlockRow {
  id: string
  type: BlockType
  data: Record<string, unknown>
  sortOrder: number
  isVisible: boolean
}

interface SeoValue {
  metaTitle?: string
  metaDescription?: string
  ogImageMediaId?: string
  noindex?: boolean
  focusKeyword?: string
  shortAnswer?: string
}

interface PageDetail {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  seo: Record<string, SeoValue>
  status: 'draft' | 'published'
  blocks: BlockRow[]
}

const route = useRoute()
const toast = useToast()
const { t } = useAdminI18n()
const pageId = route.params.id as string

const { data: page, refresh } = await useFetch<PageDetail>(`/api/admin/pages/${pageId}`)
const { data: similarPages } = await useFetch<{ pageId: string; title: string; score: number }[]>(`/api/admin/pages/${pageId}/similarity`)

const metaForm = reactive({
  title: page.value?.title.de ?? '',
  slug: page.value?.slug.de ?? '',
  status: page.value?.status ?? 'draft',
  seo: { ...(page.value?.seo.de ?? {}) } as SeoValue,
})
const savingMeta = ref(false)

async function saveMeta() {
  savingMeta.value = true
  try {
    await $fetch(`/api/admin/pages/${pageId}`, {
      method: 'PATCH',
      body: {
        title: { de: metaForm.title },
        slug: { de: metaForm.slug },
        seo: { de: metaForm.seo },
        status: metaForm.status,
      },
    })
    toast.success(t('pages.pageSaved'))
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('pages.pageSaveFailed')))
  } finally {
    savingMeta.value = false
  }
}

const isAddOpen = ref(false)
const isEditOpen = ref(false)
const editingBlock = ref<BlockRow | null>(null)
const editingData = ref<Record<string, unknown>>({})
const draggingId = ref<string | null>(null)

async function addBlock(type: BlockType) {
  try {
    await $fetch(`/api/admin/pages/${pageId}/blocks`, {
      method: 'POST',
      body: { type, data: defaultBlockData(type) },
    })
    isAddOpen.value = false
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('pages.blockAddFailed')))
  }
}

function openEdit(block: BlockRow) {
  editingBlock.value = block
  editingData.value = JSON.parse(JSON.stringify(block.data))
  isEditOpen.value = true
}

async function saveBlock() {
  if (!editingBlock.value) return
  try {
    await $fetch(`/api/admin/pages/blocks/${editingBlock.value.id}`, {
      method: 'PATCH',
      body: { data: editingData.value },
    })
    isEditOpen.value = false
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('pages.blockSaveFailed')))
  }
}

async function deleteBlock(block: BlockRow) {
  try {
    await $fetch(`/api/admin/pages/blocks/${block.id}`, { method: 'DELETE' })
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('pages.blockDeleteFailed')))
  }
}

function onDragStart(block: BlockRow) {
  draggingId.value = block.id
}

async function onDrop(target: BlockRow) {
  if (!draggingId.value || draggingId.value === target.id || !page.value) return
  const blocks = [...page.value.blocks]
  const fromIndex = blocks.findIndex((b) => b.id === draggingId.value)
  const toIndex = blocks.findIndex((b) => b.id === target.id)
  const [moved] = blocks.splice(fromIndex, 1)
  if (moved) blocks.splice(toIndex, 0, moved)
  draggingId.value = null

  try {
    await $fetch(`/api/admin/pages/${pageId}/reorder`, { method: 'PUT', body: blocks.map((b) => b.id) })
    await refresh()
  } catch (error) {
    toast.error(getErrorMessage(error, t('pages.reorderFailed')))
  }
}

function blockLabel(type: BlockType): string {
  return BLOCK_TYPES.find((b) => b.type === type)?.label ?? type
}
</script>

<template>
  <div v-if="page">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('pages.editPage') }}</h1>
      <a
        v-if="page.status === 'published'"
        :href="`/${page.slug.de}`"
        target="_blank"
        class="text-sm text-primary underline"
      >
        {{ t('pages.viewLive') }}
      </a>
    </div>

    <div v-if="similarPages?.length" class="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <p class="font-medium">{{ t('pages.similarityWarningTitle') }}</p>
      <ul class="mt-2 list-inside list-disc">
        <li v-for="similar in similarPages" :key="similar.pageId">
          {{ similar.title }} — {{ Math.round(similar.score * 100) }}% {{ t('pages.similarityMatch') }}
        </li>
      </ul>
    </div>

    <form class="mb-8 flex max-w-lg flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800" @submit.prevent="saveMeta">
      <AdminFormField :label="t('common.titleDe')">
        <input v-model="metaForm.title" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      </AdminFormField>
      <AdminFormField :label="t('common.slugDe')">
        <input v-model="metaForm.slug" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      </AdminFormField>
      <AdminFormField :label="t('common.status')">
        <select v-model="metaForm.status" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
          <option value="draft">{{ t('pages.draft') }}</option>
          <option value="published">{{ t('pages.published') }}</option>
        </select>
      </AdminFormField>
      <AdminSeoPanel v-model="metaForm.seo" :title-fallback="metaForm.title" :url="`/${metaForm.slug}`" />
      <button type="submit" class="min-h-11 w-fit rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="savingMeta">
        {{ savingMeta ? t('common.saving') : t('pages.savePage') }}
      </button>
    </form>

    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('pages.blocks') }}</h2>
      <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="isAddOpen = true">
        {{ t('pages.addBlock') }}
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <div
        v-for="block in page.blocks"
        :key="block.id"
        draggable="true"
        class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 last:border-b-0 dark:border-slate-700 dark:bg-slate-800"
        @dragstart="onDragStart(block)"
        @dragover.prevent
        @drop="onDrop(block)"
      >
        <div class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span class="cursor-move text-slate-400">&#10087;</span>
          <span class="font-medium">{{ blockLabel(block.type) }}</span>
        </div>
        <div class="flex gap-3 text-xs">
          <button type="button" class="text-primary underline" @click="openEdit(block)">{{ t('common.edit') }}</button>
          <button type="button" class="text-red-600 underline" @click="deleteBlock(block)">{{ t('common.delete') }}</button>
        </div>
      </div>
      <p v-if="!page.blocks.length" class="px-4 py-6 text-center text-sm text-slate-400">
        {{ t('pages.noBlocksYet') }}
      </p>
    </div>

    <AdminModal :open="isAddOpen" :title="t('pages.addBlock')" @close="isAddOpen = false">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="option in BLOCK_TYPES"
          :key="option.type"
          type="button"
          class="rounded-md border border-slate-300 px-3 py-2 text-left text-sm hover:border-primary dark:border-slate-600"
          @click="addBlock(option.type)"
        >
          {{ option.label }}
        </button>
      </div>
    </AdminModal>

    <AdminModal :open="isEditOpen" :title="editingBlock ? t('pages.editBlockTitle', { type: blockLabel(editingBlock.type) }) : ''" @close="isEditOpen = false">
      <AdminBlocksBlockForm v-if="editingBlock" v-model:data="editingData" :type="editingBlock.type" />
      <button type="button" class="mt-4 min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="saveBlock">
        {{ t('pages.saveBlock') }}
      </button>
    </AdminModal>
  </div>
</template>
