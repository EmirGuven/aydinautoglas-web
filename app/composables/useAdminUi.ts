export function useAdminUi() {
  const sidebarCollapsed = useState('admin-sidebar-collapsed', () => false)
  const mobileSidebarOpen = useState('admin-sidebar-mobile-open', () => false)
  const colorMode = useState<'light' | 'dark'>('admin-color-mode', () => 'light')

  function applyColorMode() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
    }
  }

  function toggleColorMode() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
    if (import.meta.client) {
      localStorage.setItem('admin-color-mode', colorMode.value)
    }
    applyColorMode()
  }

  function initColorMode() {
    if (import.meta.client) {
      const stored = localStorage.getItem('admin-color-mode')
      if (stored === 'dark' || stored === 'light') {
        colorMode.value = stored
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        colorMode.value = 'dark'
      }
      applyColorMode()
    }
  }

  return {
    sidebarCollapsed,
    mobileSidebarOpen,
    colorMode,
    toggleColorMode,
    initColorMode,
  }
}
