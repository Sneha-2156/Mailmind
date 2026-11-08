import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Global subscribers for toast events
type ToastListener = (toasts: ToastItem[]) => void
let toastsList: ToastItem[] = []
const listeners = new Set<ToastListener>()

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toastsList]))
}

export const addToast = (type: ToastType, message: string, duration = 4000) => {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast: ToastItem = { id, type, message, duration }
  toastsList = [...toastsList, newToast]
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

export const removeToast = (id: string) => {
  toastsList = toastsList.filter((t) => t.id !== id)
  notifyListeners()
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
          }

          const borderColors = {
            success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
            error: 'border-red-500/30 bg-red-950/80 text-red-100',
            warning: 'border-amber-500/30 bg-amber-950/80 text-amber-100',
            info: 'border-indigo-500/30 bg-indigo-950/80 text-indigo-100',
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-xl ${borderColors[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 text-sm font-medium leading-snug break-words">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity p-0.5 text-current rounded-md hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
