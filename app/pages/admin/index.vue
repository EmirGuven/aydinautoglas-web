<script setup lang="ts">
import { CalendarClock, FileCheck, FileText, MessageSquare, Palette, Wrench } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

interface AppointmentRow { id: string, contactName: string, createdAt: string }
interface MessageRow { id: string, name: string, email: string, isRead: boolean, createdAt: string }

const { user } = useAuth()
const { t } = useAdminI18n()

const { data: appointments } = await useFetch<AppointmentRow[]>('/api/admin/appointments')
const { data: messages } = await useFetch<MessageRow[]>('/api/admin/contact-messages')
const { data: pages } = await useFetch<{ status: string }[]>('/api/admin/pages')

const unreadCount = computed(() => messages.value?.filter((m) => !m.isRead).length ?? 0)
const publishedCount = computed(() => pages.value?.filter((p) => p.status === 'published').length ?? 0)
const recentAppointments = computed(() => appointments.value?.slice(0, 5) ?? [])
const recentMessages = computed(() => messages.value?.slice(0, 5) ?? [])

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const quickLinks = [
  { to: '/admin/services', label: 'nav.services', icon: Wrench },
  { to: '/admin/pages', label: 'nav.pages', icon: FileText },
  { to: '/admin/appearance/theme', label: 'nav.appearance', icon: Palette },
]
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

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('dashboard.recentAppointments') }}</h2>
          <NuxtLink to="/admin/appointments" class="text-xs font-medium text-indigo-600 hover:underline">{{ t('dashboard.viewAll') }}</NuxtLink>
        </div>
        <ul v-if="recentAppointments.length" class="divide-y divide-slate-100 dark:divide-slate-700">
          <li v-for="row in recentAppointments" :key="row.id" class="flex items-center justify-between px-5 py-3">
            <span class="text-sm text-slate-700 dark:text-slate-200">{{ row.contactName }}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(row.createdAt) }}</span>
          </li>
        </ul>
        <p v-else class="px-5 py-6 text-center text-sm text-slate-500 dark:text-slate-400">{{ t('dashboard.noRecentAppointments') }}</p>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('dashboard.quickLinks') }}</h2>
        </div>
        <nav class="flex flex-col gap-1 p-3">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <component :is="link.icon" class="h-4 w-4 shrink-0 text-slate-400" />
            {{ t(link.label) }}
          </NuxtLink>
        </nav>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-3">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('dashboard.recentMessages') }}</h2>
          <NuxtLink to="/admin/appointments" class="text-xs font-medium text-indigo-600 hover:underline">{{ t('dashboard.viewAll') }}</NuxtLink>
        </div>
        <ul v-if="recentMessages.length" class="divide-y divide-slate-100 dark:divide-slate-700">
          <li v-for="row in recentMessages" :key="row.id" class="flex items-center justify-between gap-4 px-5 py-3">
            <div class="flex min-w-0 items-center gap-2">
              <span v-if="!row.isRead" class="h-2 w-2 shrink-0 rounded-full bg-indigo-600" :aria-label="t('dashboard.unread')" />
              <span class="truncate text-sm text-slate-700 dark:text-slate-200">{{ row.name }} &middot; {{ row.email }}</span>
            </div>
            <span class="shrink-0 text-xs text-slate-500 dark:text-slate-400">{{ formatDate(row.createdAt) }}</span>
          </li>
        </ul>
        <p v-else class="px-5 py-6 text-center text-sm text-slate-500 dark:text-slate-400">{{ t('dashboard.noRecentMessages') }}</p>
      </div>
    </div>
  </div>
</template>
