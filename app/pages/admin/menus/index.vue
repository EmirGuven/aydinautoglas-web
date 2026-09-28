<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface MenuItemNode {
  id: string
  menuId: string
  parentId: string | null
  label: Record<string, string>
  linkType: string
  linkValue: string
  sortOrder: number
  children: MenuItemNode[]
}

interface FlatItem {
  node: MenuItemNode
  depth: number
}

const toast = useToast()
const { t } = useAdminI18n()
const location = ref<'header' | 'footer'>('header')
const tree = ref<MenuItemNode[]>([])
const loading = ref(true)
const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const draggingId = ref<string | null>(null)

const form = reactive({
  label: '',
  linkType: 'url' as 'page' | 'url',
  linkValue: '',
  parentId: '' as string | '',
})

async function load() {
  loading.value = true
  try {
    tree.value = await $fetch<MenuItemNode[]>(`/api/admin/menus/${location.value}`)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(location, load)

const flatItems = computed<FlatItem[]>(() => {
  const result: FlatItem[] = []
  const walk = (nodes: MenuItemNode[], depth: number) => {
    for (const node of nodes) {
      result.push({ node, depth })
      walk(node.children, depth + 1)
    }
  }
  walk(tree.value, 0)
  return result
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { label: '', linkType: 'url', linkValue: '', parentId: '' })
  isFormOpen.value = true
}

function openEdit(item: MenuItemNode) {
  editingId.value = item.id
  Object.assign(form, {
    label: item.label.de ?? '',
    linkType: item.linkType,
    linkValue: item.linkValue,
    parentId: item.parentId ?? '',
  })
  isFormOpen.value = true
}

async function submitForm() {
  const payload = {
    label: { de: form.label },
    linkType: form.linkType,
    linkValue: form.linkValue,
    parentId: form.parentId || null,
  }
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/menus/items/${editingId.value}`, { method: 'PATCH', body: payload })
      toast.success(t('menus.itemUpdated'))
    } else {
      await $fetch(`/api/admin/menus/${location.value}/items`, { method: 'POST', body: payload })
      toast.success(t('menus.itemAdded'))
    }
    isFormOpen.value = false
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, t('menus.itemSaveFailed')))
  }
}

async function removeItem(item: MenuItemNode) {
  try {
    await $fetch(`/api/admin/menus/items/${item.id}`, { method: 'DELETE' })
    toast.success(t('menus.itemDeleted'))
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, t('menus.itemDeleteFailed')))
  }
}

function onDragStart(item: MenuItemNode) {
  draggingId.value = item.id
}

async function onDrop(target: MenuItemNode) {
  if (!draggingId.value || draggingId.value === target.id) return
  const dragged = flatItems.value.find((f) => f.node.id === draggingId.value)?.node
  if (!dragged) return

  // Only reorder among items that share the same parent, to keep this predictable;
  // use the edit form's "Parent" field to re-parent an item.
  if (dragged.parentId !== target.parentId) {
    toast.error(t('menus.dragSameLevel'))
    draggingId.value = null
    return
  }

  const siblings = flatItems.value
    .map((f) => f.node)
    .filter((n) => n.parentId === target.parentId)
    .filter((n) => n.id !== dragged.id)

  const targetIndex = siblings.findIndex((n) => n.id === target.id)
  siblings.splice(targetIndex, 0, dragged)

  const updates = siblings.map((n, index) => ({ id: n.id, parentId: n.parentId, sortOrder: index }))
  draggingId.value = null

  try {
    await $fetch(`/api/admin/menus/${location.value}/reorder`, { method: 'PUT', body: updates })
    await load()
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.reorderFailed')))
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('menus.title') }}</h1>
      <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreate">
        {{ t('menus.newItem') }}
      </button>
    </div>

    <div class="mb-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="location === 'header' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        @click="location = 'header'"
      >
        {{ t('menus.header') }}
      </button>
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="location === 'footer' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        @click="location = 'footer'"
      >
        {{ t('menus.footer') }}
      </button>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">{{ t('common.loading') }}</p>
    <div v-else class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
      <div
        v-for="item in flatItems"
        :key="item.node.id"
        draggable="true"
        class="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-2 last:border-b-0 dark:border-slate-700 dark:bg-slate-800"
        :style="{ paddingLeft: `${12 + item.depth * 24}px` }"
        @dragstart="onDragStart(item.node)"
        @dragover.prevent
        @drop="onDrop(item.node)"
      >
        <div class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span class="cursor-move text-slate-400">⠿</span>
          <span class="font-medium">{{ item.node.label.de }}</span>
          <span class="text-xs text-slate-400">({{ item.node.linkType }}: {{ item.node.linkValue }})</span>
        </div>
        <div class="flex gap-3 text-xs">
          <button type="button" class="text-primary underline" @click="openEdit(item.node)">{{ t('common.edit') }}</button>
          <button type="button" class="text-red-600 underline" @click="removeItem(item.node)">{{ t('common.delete') }}</button>
        </div>
      </div>
      <p v-if="!flatItems.length" class="px-3 py-6 text-center text-sm text-slate-400">{{ t('menus.noItemsYet') }}</p>
    </div>

    <AdminModal :open="isFormOpen" :title="editingId ? t('menus.editItem') : t('menus.newMenuItem')" @close="isFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitForm">
        <AdminFormField :label="t('menus.labelDe')">
          <input
            v-model="form.label"
            required
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('menus.linkType')">
          <select
            v-model="form.linkType"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="url">{{ t('menus.customUrl') }}</option>
            <option value="page">{{ t('menus.page') }}</option>
          </select>
        </AdminFormField>
        <AdminFormField :label="t('menus.linkValue')" :hint="t('menus.linkValueHint')">
          <input
            v-model="form.linkValue"
            required
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
        </AdminFormField>
        <AdminFormField :label="t('menus.parentItem')">
          <select
            v-model="form.parentId"
            class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">{{ t('menus.topLevel') }}</option>
            <option v-for="item in flatItems" :key="item.node.id" :value="item.node.id" :disabled="item.node.id === editingId">
              {{ '—'.repeat(item.depth) }} {{ item.node.label.de }}
            </option>
          </select>
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">
          {{ editingId ? t('menus.saveChanges') : t('menus.addItem') }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
