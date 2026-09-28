<script setup lang="ts">
import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from '@lucide/vue'

const { sidebarCollapsed, mobileSidebarOpen, colorMode, toggleColorMode } = useAdminUi()
const { user, logout } = useAuth()
const { t } = useAdminI18n()
const router = useRouter()

const profileMenuOpen = ref(false)

async function handleLogout() {
  await logout()
  await router.push('/admin/login')
}
</script>

<template>
  <header class="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
    <button
      type="button"
      class="flex h-11 w-11 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
      :aria-label="t('topbar.toggleMenu')"
      @click="mobileSidebarOpen = !mobileSidebarOpen"
    >
      <Menu class="h-5 w-5" />
    </button>
    <button
      type="button"
      class="hidden h-11 w-11 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 lg:flex"
      :aria-label="sidebarCollapsed ? t('topbar.expandSidebar') : t('topbar.collapseSidebar')"
      @click="sidebarCollapsed = !sidebarCollapsed"
    >
      <PanelLeftClose v-if="!sidebarCollapsed" class="h-5 w-5" />
      <PanelLeftOpen v-else class="h-5 w-5" />
    </button>

    <input
      type="search"
      :placeholder="t('topbar.search')"
      class="hidden min-h-11 w-64 rounded-md border border-slate-300 px-3 text-sm sm:block text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
    >

    <div class="ml-auto flex items-center gap-2">
      <AdminLanguageSwitcher />
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        :aria-label="t('topbar.toggleDarkMode')"
        @click="toggleColorMode"
      >
        <Sun v-if="colorMode === 'dark'" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </button>

      <div class="relative">
        <button
          type="button"
          class="flex min-h-11 items-center gap-2 rounded-md px-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          :aria-label="t('topbar.accountMenuFor', { name: user?.name ?? '' })"
          :aria-expanded="profileMenuOpen"
          @click="profileMenuOpen = !profileMenuOpen"
        >
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {{ user?.name?.[0]?.toUpperCase() ?? '?' }}
          </span>
          <span class="hidden text-sm sm:block">{{ user?.name }}</span>
        </button>
        <div
          v-if="profileMenuOpen"
          class="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div class="border-b border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-700">
            {{ user?.email }} &middot; {{ user?.role }}
          </div>
          <button
            type="button"
            class="block w-full min-h-11 px-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            @click="handleLogout"
          >
            {{ t('topbar.logOut') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
