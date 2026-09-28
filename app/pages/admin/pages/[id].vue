<script setup lang="ts">
import { BLOCK_TYPES, defaultBlockData, type BlockType } from '#shared/schemas/blocks'
import {
  BadgeCheck,
  Columns3,
  Contact,
  FileText,
  Gauge,
  GripVertical,
  Image,
  Images,
  LayoutGrid,
  Layers,
  MapPin,
  MessageSquareQuote,
  Newspaper,
  ShieldQuestion,
  Sparkles,
  SquareCheckBig,
  Wrench,
} from '@lucide/vue'

const BLOCK_ICONS: Record<BlockType, unknown> = {
  'hero': Sparkles,
  'service-cards': Wrench,
  'how-it-works': Layers,
  'damage-wizard': ShieldQuestion,
  'why-us': BadgeCheck,
  'stats-counter': Gauge,
  'testimonials': MessageSquareQuote,
  'partners': BadgeCheck,
  'branch-finder': MapPin,
  'faq-accordion': ShieldQuestion,
  'blog-preview': Newspaper,
  'cta-band': LayoutGrid,
  'rich-text': FileText,
  'image-text': Image,
  'gallery': Images,
  'contact-form': Contact,
  'comparison-table': Columns3,
  'certificates': SquareCheckBig,
}

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
const dragOverId = ref<string | null>(null)

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
  dragOverId.value = null
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

function blockPreview(block: BlockRow): string {
  const heading = block.data.heading as Record<string, string> | undefined
  const text = heading?.de || (block.data.title as Record<string, string> | undefined)?.de
  return text?.trim() || ''
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
        class="text-sm text-indigo-600 underline"
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

    <form class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" @submit.prevent="saveMeta">
      <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('pages.editPage') }}</h2>
        <div class="flex flex-col gap-4">
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
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <AdminSeoPanel v-model="metaForm.seo" :title-fallback="metaForm.title" :url="`/${metaForm.slug}`" />
        </div>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="savingMeta">
          {{ savingMeta ? t('common.saving') : t('pages.savePage') }}
        </button>
      </div>
    </form>

    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('pages.blocks') }}</h2>
      <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="isAddOpen = true">
        {{ t('pages.addBlock') }}
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <template v-for="block in page.blocks" :key="block.id">
        <div class="h-0.5 transition-colors" :class="dragOverId === block.id && draggingId !== block.id ? 'bg-indigo-500' : 'bg-transparent'" />
        <div
          draggable="true"
          class="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 transition-opacity last:border-b-0 dark:border-slate-700 dark:bg-slate-800"
          :class="draggingId === block.id && 'opacity-40'"
          @dragstart="onDragStart(block)"
          @dragenter="dragOverId = block.id"
          @dragover.prevent
          @dragleave="dragOverId === block.id && (dragOverId = null)"
          @drop="onDrop(block)"
          @dragend="draggingId = null; dragOverId = null"
        >
          <div class="flex min-w-0 items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <GripVertical class="h-4 w-4 shrink-0 cursor-move text-slate-400" />
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <component :is="BLOCK_ICONS[block.type]" class="h-4 w-4" />
            </span>
            <span class="min-w-0">
              <span class="block font-medium">{{ blockLabel(block.type) }}</span>
              <span v-if="blockPreview(block)" class="block truncate text-xs text-slate-500 dark:text-slate-400">{{ blockPreview(block) }}</span>
            </span>
          </div>
          <div class="flex shrink-0 gap-3 text-xs">
            <button type="button" class="text-indigo-600 underline" @click="openEdit(block)">{{ t('common.edit') }}</button>
            <button type="button" class="text-red-600 underline" @click="deleteBlock(block)">{{ t('common.delete') }}</button>
          </div>
        </div>
      </template>
      <AdminEmptyState v-if="!page.blocks.length" :icon="Layers" :message="t('pages.noBlocksYet')" />
    </div>

    <AdminModal :open="isAddOpen" :title="t('pages.addBlock')" @close="isAddOpen = false">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="option in BLOCK_TYPES"
          :key="option.type"
          type="button"
          class="flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-left text-sm hover:border-indigo-600 hover:bg-indigo-50 dark:border-slate-600 dark:hover:bg-indigo-900/20"
          @click="addBlock(option.type)"
        >
          <component :is="BLOCK_ICONS[option.type]" class="h-4 w-4 shrink-0 text-indigo-600" />
          {{ option.label }}
        </button>
      </div>
    </AdminModal>

    <AdminModal :open="isEditOpen" :title="editingBlock ? t('pages.editBlockTitle', { type: blockLabel(editingBlock.type) }) : ''" @close="isEditOpen = false">
      <AdminBlocksBlockForm v-if="editingBlock" v-model:data="editingData" :type="editingBlock.type" />
      <button type="button" class="mt-4 min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="saveBlock">
        {{ t('pages.saveBlock') }}
      </button>
    </AdminModal>
  </div>
</template>
