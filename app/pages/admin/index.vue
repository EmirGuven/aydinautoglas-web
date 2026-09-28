<script setup lang="ts">
import { CalendarClock, FileCheck, MessageSquare } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

const { user } = useAuth()
const { t } = useAdminI18n()

const { data: appointments } = await useFetch<unknown[]>('/api/admin/appointments')
const { data: messages } = await useFetch<{ isRead: boolean }[]>('/api/admin/contact-messages')
const { data: pages } = await useFetch<{ status: string }[]>('/api/admin/pages')

const unreadCount = computed(() => messages.value?.filter((m) => !m.isRead).length ?? 0)
const publishedCount = computed(() => pages.value?.filter((p) => p.status === 'published').length ?? 0)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('nav.dashboard') }}</h1>
    <p class="mt-2 text-slate-600 dark:text-slate-400">
      {{ t('dashboard.welcomeBack', { name: user?.name ?? '' }) }}
    </p>
    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NuxtLink
        to="/admin/appointments"
        class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <CalendarClock class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('dashboard.appointments') }}</p>
          <p class="text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ appointments?.length ?? '—' }}</p>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/appointments"
        class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <MessageSquare class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('dashboard.unreadMessages') }}</p>
          <p class="text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ unreadCount }}</p>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/pages"
        class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <FileCheck class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('dashboard.publishedPages') }}</p>
          <p class="text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ publishedCount }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
