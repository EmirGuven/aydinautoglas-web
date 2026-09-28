<script setup lang="ts">
import {
  BadgeCheck,
  CalendarClock,
  FileText,
  Images,
  Languages,
  LayoutDashboard,
  ListTree,
  MapPin,
  MessageSquareQuote,
  Newspaper,
  Palette,
  Search,
  Settings,
  ShieldQuestion,
  Signpost,
  Table,
  Users,
  Wrench,
  CircleHelp,
} from '@lucide/vue'

const { sidebarCollapsed, mobileSidebarOpen } = useAdminUi()
const { t } = useAdminI18n()

const navItems = computed(() => [
  { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
  { to: '/admin/pages', label: t('nav.pages'), icon: FileText },
  { to: '/admin/appointments', label: t('nav.appointments'), icon: CalendarClock },
  { to: '/admin/services', label: t('nav.services'), icon: Wrench },
  { to: '/admin/locations', label: t('nav.branches'), icon: MapPin },
  { to: '/admin/blog', label: t('nav.blog'), icon: Newspaper },
  { to: '/admin/faqs', label: t('nav.faqs'), icon: CircleHelp },
  { to: '/admin/damage-wizard', label: t('nav.damageWizard'), icon: ShieldQuestion },
  { to: '/admin/testimonials', label: t('nav.testimonials'), icon: MessageSquareQuote },
  { to: '/admin/partners', label: t('nav.partners'), icon: BadgeCheck },
  { to: '/admin/media', label: t('nav.media'), icon: Images },
  { to: '/admin/menus', label: t('nav.menus'), icon: ListTree },
  { to: '/admin/redirects', label: t('nav.redirects'), icon: Signpost },
  { to: '/admin/seo-report', label: t('nav.seoReport'), icon: Search },
  { to: '/admin/bulk-seo', label: t('nav.bulkSeo'), icon: Table },
  { to: '/admin/translations', label: t('nav.translations'), icon: Languages },
  { to: '/admin/appearance/theme', label: t('nav.appearance'), icon: Palette },
  { to: '/admin/settings', label: t('nav.settings'), icon: Settings },
  { to: '/admin/users', label: t('nav.users'), icon: Users },
])

function closeMobile() {
  mobileSidebarOpen.value = false
}
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="mobileSidebarOpen"
    class="fixed inset-0 z-30 bg-black/40 lg:hidden"
    @click="closeMobile"
  />

  <aside
    class="fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-200 transition-all duration-200 lg:static lg:translate-x-0"
    :class="[
      sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'w-64',
    ]"
  >
    <div class="flex h-16 items-center px-4 text-lg font-semibold text-white">
      <span v-if="!sidebarCollapsed">Admin</span>
      <span v-else>A</span>
    </div>
    <nav class="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="group flex min-h-11 items-center gap-3 rounded-md border-l-2 border-transparent px-3 text-sm text-slate-300 transition-colors hover:bg-slate-800/70 hover:text-white"
        active-class="router-link-active !border-indigo-500 !bg-slate-800 !text-white"
        @click="closeMobile"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-white group-[.router-link-active]:text-indigo-400" />
        <span v-if="!sidebarCollapsed">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>
