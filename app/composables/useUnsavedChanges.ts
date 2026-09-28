/**
 * Warns before leaving the page (browser navigation and in-app route changes)
 * while `isDirty` is true. Used by admin forms.
 */
export function useUnsavedChanges(isDirty: Ref<boolean>) {
  function beforeUnload(event: BeforeUnloadEvent) {
    if (isDirty.value) {
      event.preventDefault()
    }
  }

  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))

  onBeforeRouteLeave(() => {
    if (isDirty.value) {
      return window.confirm('You have unsaved changes. Leave this page anyway?')
    }
    return true
  })
}
