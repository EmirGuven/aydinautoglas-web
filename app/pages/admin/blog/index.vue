<script setup lang="ts">
import type { DataTableColumn } from '../../../components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

interface CategoryRow {
  id: string
  slug: Record<string, string>
  name: Record<string, string>
}

interface SeoValue {
  metaTitle?: string
  metaDescription?: string
  noindex?: boolean
  focusKeyword?: string
  shortAnswer?: string
}

interface PostRow {
  id: string
  categoryId?: string
  slug: Record<string, string>
  title: Record<string, string>
  excerpt: Record<string, string>
  content: Record<string, string>
  coverMediaId?: string
  publishedByLocale: Record<string, boolean>
  authorName?: string
  authorRole: Record<string, string>
  authorPhotoMediaId?: string
  shortAnswer: Record<string, string>
  seo: Record<string, SeoValue>
}

const toast = useToast()
const { t } = useAdminI18n()
const tab = ref<'posts' | 'categories'>('posts')

const { data: categories, refresh: refreshCategories } = await useFetch<CategoryRow[]>('/api/admin/blog/categories')
const { data: posts, refresh: refreshPosts } = await useFetch<PostRow[]>('/api/admin/blog/posts')

const postColumns = computed<DataTableColumn<PostRow>[]>(() => [
  { key: 'title', label: t('common.name'), format: (row) => row.title.de ?? '' },
  { key: 'slug', label: t('common.slugDe'), format: (row) => `/${row.slug.de ?? ''}` },
])

// --- Post form ---
const isPostFormOpen = ref(false)
const editingPostId = ref<string | null>(null)
const deletePostTarget = ref<PostRow | null>(null)
const postFormError = ref('')
const postSubmitting = ref(false)

const postForm = reactive({
  categoryId: '' as string | '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverMediaId: undefined as string | undefined,
  publishedDe: false,
  authorName: '',
  authorRole: '',
  authorPhotoMediaId: undefined as string | undefined,
  shortAnswer: '',
  seo: {} as SeoValue,
})

function openCreatePost() {
  editingPostId.value = null
  Object.assign(postForm, {
    categoryId: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverMediaId: undefined,
    publishedDe: false,
    authorName: '',
    authorRole: '',
    authorPhotoMediaId: undefined,
    shortAnswer: '',
    seo: {},
  })
  postFormError.value = ''
  isPostFormOpen.value = true
}

function openEditPost(row: PostRow) {
  editingPostId.value = row.id
  Object.assign(postForm, {
    categoryId: row.categoryId ?? '',
    title: row.title.de ?? '',
    slug: row.slug.de ?? '',
    excerpt: row.excerpt.de ?? '',
    content: row.content.de ?? '',
    coverMediaId: row.coverMediaId,
    publishedDe: !!row.publishedByLocale.de,
    authorName: row.authorName ?? '',
    authorRole: row.authorRole.de ?? '',
    authorPhotoMediaId: row.authorPhotoMediaId,
    shortAnswer: row.shortAnswer.de ?? '',
    seo: { ...(row.seo.de ?? {}) },
  })
  postFormError.value = ''
  isPostFormOpen.value = true
}

async function submitPost() {
  postFormError.value = ''
  postSubmitting.value = true
  const payload = {
    categoryId: postForm.categoryId || undefined,
    title: { de: postForm.title },
    slug: { de: postForm.slug },
    excerpt: { de: postForm.excerpt },
    content: { de: postForm.content },
    coverMediaId: postForm.coverMediaId || undefined,
    publishedByLocale: { de: postForm.publishedDe },
    authorName: postForm.authorName || undefined,
    authorRole: { de: postForm.authorRole },
    authorPhotoMediaId: postForm.authorPhotoMediaId || undefined,
    shortAnswer: { de: postForm.shortAnswer },
    seo: { de: postForm.seo },
  }
  try {
    if (editingPostId.value) {
      await $fetch(`/api/admin/blog/posts/${editingPostId.value}`, { method: 'PATCH', body: payload })
      toast.success(t('blog.postUpdated'))
    } else {
      await $fetch('/api/admin/blog/posts', { method: 'POST', body: payload })
      toast.success(t('blog.postCreated'))
    }
    isPostFormOpen.value = false
    await refreshPosts()
  } catch (error) {
    postFormError.value = getErrorMessage(error, t('blog.postSaveFailed'))
  } finally {
    postSubmitting.value = false
  }
}

async function confirmDeletePost() {
  if (!deletePostTarget.value) return
  try {
    await $fetch(`/api/admin/blog/posts/${deletePostTarget.value.id}`, { method: 'DELETE' })
    toast.success(t('blog.postDeleted'))
    deletePostTarget.value = null
    await refreshPosts()
  } catch (error) {
    toast.error(getErrorMessage(error, t('blog.postDeleteFailed')))
    deletePostTarget.value = null
  }
}

// --- Category form ---
const isCategoryFormOpen = ref(false)
const editingCategoryId = ref<string | null>(null)
const categoryForm = reactive({ name: '', slug: '' })
const categoryFormError = ref('')

function openCreateCategory() {
  editingCategoryId.value = null
  Object.assign(categoryForm, { name: '', slug: '' })
  categoryFormError.value = ''
  isCategoryFormOpen.value = true
}

function openEditCategory(row: CategoryRow) {
  editingCategoryId.value = row.id
  Object.assign(categoryForm, { name: row.name.de ?? '', slug: row.slug.de ?? '' })
  categoryFormError.value = ''
  isCategoryFormOpen.value = true
}

async function submitCategory() {
  categoryFormError.value = ''
  const payload = { name: { de: categoryForm.name }, slug: { de: categoryForm.slug } }
  try {
    if (editingCategoryId.value) {
      await $fetch(`/api/admin/blog/categories/${editingCategoryId.value}`, { method: 'PATCH', body: payload })
    } else {
      await $fetch('/api/admin/blog/categories', { method: 'POST', body: payload })
    }
    toast.success(t('blog.categorySaved'))
    isCategoryFormOpen.value = false
    await refreshCategories()
  } catch (error) {
    categoryFormError.value = getErrorMessage(error, t('blog.categorySaveFailed'))
  }
}

async function deleteCategory(row: CategoryRow) {
  try {
    await $fetch(`/api/admin/blog/categories/${row.id}`, { method: 'DELETE' })
    toast.success(t('blog.categoryDeleted'))
    await refreshCategories()
  } catch (error) {
    toast.error(getErrorMessage(error, t('blog.categoryDeleteFailed')))
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('blog.title') }}</h1>

    <div class="mb-4 mt-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        @click="tab = 'posts'"
      >
        {{ t('blog.posts') }}
      </button>
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-slate-500'"
        @click="tab = 'categories'"
      >
        {{ t('blog.categories') }}
      </button>
    </div>

    <div v-if="tab === 'posts'">
      <div class="mb-4 flex justify-end">
        <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreatePost">
          {{ t('blog.newPost') }}
        </button>
      </div>
      <AdminDataTable :columns="postColumns" :rows="posts ?? []" row-key="id">
        <template #cell-slug="{ row }">
          <div class="flex items-center gap-3">
            <span>/{{ row.slug.de }}</span>
            <span v-if="row.publishedByLocale.de" class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{{ t('pages.published') }}</span>
            <button type="button" class="text-xs text-primary underline" @click="openEditPost(row)">{{ t('common.edit') }}</button>
            <button type="button" class="text-xs text-red-600 underline" @click="deletePostTarget = row">{{ t('common.delete') }}</button>
          </div>
        </template>
      </AdminDataTable>
    </div>

    <div v-else>
      <div class="mb-4 flex justify-end">
        <button type="button" class="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white" @click="openCreateCategory">
          {{ t('blog.newCategory') }}
        </button>
      </div>
      <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
        >
          <span class="text-sm text-slate-700 dark:text-slate-200">{{ category.name.de }}</span>
          <div class="flex gap-3 text-xs">
            <button type="button" class="text-primary underline" @click="openEditCategory(category)">{{ t('common.edit') }}</button>
            <button type="button" class="text-red-600 underline" @click="deleteCategory(category)">{{ t('common.delete') }}</button>
          </div>
        </div>
        <p v-if="!categories?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('blog.noCategoriesYet') }}</p>
      </div>
    </div>

    <AdminModal :open="isPostFormOpen" :title="editingPostId ? t('blog.editPost') : t('blog.newPost')" @close="isPostFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitPost">
        <AdminFormField :label="t('faqs.category')">
          <select v-model="postForm.categoryId" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option value="">{{ t('faqs.none') }}</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name.de }}</option>
          </select>
        </AdminFormField>
        <AdminFormField :label="t('common.titleDe')">
          <input v-model="postForm.title" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.slugDe')">
          <input v-model="postForm.slug" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('blog.excerptDe')">
          <input v-model="postForm.excerpt" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.contentDe')">
          <AdminRichTextEditor v-model="postForm.content" />
        </AdminFormField>
        <AdminFormField :label="t('blog.coverImage')">
          <AdminMediaPicker v-model="postForm.coverMediaId" />
        </AdminFormField>
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input v-model="postForm.publishedDe" type="checkbox">
          {{ t('blog.publishedDe') }}
        </label>

        <AdminFormField :label="t('blog.authorName')">
          <input v-model="postForm.authorName" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('blog.authorRoleDe')">
          <input v-model="postForm.authorRole" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('blog.authorPhoto')">
          <AdminMediaPicker v-model="postForm.authorPhotoMediaId" />
        </AdminFormField>
        <AdminFormField :label="t('blog.shortAnswerDe')">
          <textarea v-model="postForm.shortAnswer" rows="2" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
        </AdminFormField>

        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('blog.seoSection') }}</h3>
        <AdminSeoPanel v-model="postForm.seo" :title-fallback="postForm.title" :url="`/blog/${postForm.slug}`" />

        <p v-if="postFormError" class="text-xs text-red-600">{{ postFormError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white disabled:opacity-60" :disabled="postSubmitting">
          {{ postSubmitting ? t('common.saving') : t('common.save') }}
        </button>
      </form>
    </AdminModal>

    <AdminModal :open="isCategoryFormOpen" :title="editingCategoryId ? t('blog.editCategory') : t('blog.newCategory')" @close="isCategoryFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitCategory">
        <AdminFormField :label="t('locations.nameDe')">
          <input v-model="categoryForm.name" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('common.slugDe')">
          <input v-model="categoryForm.slug" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <p v-if="categoryFormError" class="text-xs text-red-600">{{ categoryFormError }}</p>
        <button type="submit" class="min-h-11 rounded-md bg-primary text-sm font-medium text-white">{{ t('common.save') }}</button>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      :open="!!deletePostTarget"
      :message="t('common.confirmDeleteGeneric', { name: deletePostTarget?.title.de ?? '' })"
      :confirm-label="t('common.delete')"
      danger
      @confirm="confirmDeletePost"
      @cancel="deletePostTarget = null"
    />
  </div>
</template>
