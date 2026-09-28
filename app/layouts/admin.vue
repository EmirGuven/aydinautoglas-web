<script setup lang="ts">
const { initColorMode } = useAdminUi()
onMounted(initColorMode)
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-text dark:bg-slate-900 dark:text-slate-100">
    <AdminSidebar />
    <div class="flex min-h-screen flex-1 flex-col">
      <AdminTopbar />
      <main class="flex-1 p-4 sm:p-6">
        <AdminBreadcrumb />
        <slot />
      </main>
    </div>
    <AdminToastContainer />
  </div>
</template>
