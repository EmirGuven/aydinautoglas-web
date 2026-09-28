<script setup lang="ts">
const { toasts, dismiss } = useToast()

const typeClasses: Record<string, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
    <TransitionGroup name="toast" tag="div" class="flex w-full max-w-sm flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg"
        :class="typeClasses[toast.type]"
        role="status"
      >
        <span class="flex-1">{{ toast.text }}</span>
        <button type="button" class="text-white/80 hover:text-white" @click="dismiss(toast.id)">
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
