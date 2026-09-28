export interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info'
  text: string
}

let nextId = 1

export function useToast() {
  const toasts = useState<ToastMessage[]>('admin-toasts', () => [])

  function push(text: string, type: ToastMessage['type'] = 'info') {
    const id = nextId++
    toasts.value.push({ id, type, text })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4000)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    success: (text: string) => push(text, 'success'),
    error: (text: string) => push(text, 'error'),
    info: (text: string) => push(text, 'info'),
    dismiss,
  }
}
