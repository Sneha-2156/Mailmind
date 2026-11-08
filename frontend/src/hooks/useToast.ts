import { useCallback } from 'react'
import { addToast } from '@/components/ui/Toast'

export const useToast = () => {
  const success = useCallback((message: string, duration?: number) => {
    addToast('success', message, duration)
  }, [])

  const error = useCallback((message: string, duration?: number) => {
    addToast('error', message, duration)
  }, [])

  const warning = useCallback((message: string, duration?: number) => {
    addToast('warning', message, duration)
  }, [])

  const info = useCallback((message: string, duration?: number) => {
    addToast('info', message, duration)
  }, [])

  return {
    success,
    error,
    warning,
    info,
  }
}
