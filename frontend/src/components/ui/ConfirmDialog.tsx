import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle, HelpCircle } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div
          className={`p-2.5 rounded-full shrink-0 ${
            variant === 'danger'
              ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
              : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
          }`}
        >
          {variant === 'danger' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <HelpCircle className="w-5 h-5" />
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
          {message}
        </p>
      </div>
    </Modal>
  )
}
