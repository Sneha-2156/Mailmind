import React from 'react'
import type { Priority } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatPriority } from '@/utils/format'

export interface PriorityBadgeProps {
  priority: Priority | string | null | undefined
  size?: 'sm' | 'md'
  className?: string
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  className = '',
}) => {
  const normPriority = (priority?.toLowerCase() || 'low') as Priority

  const variantMap: Record<Priority, 'danger' | 'warning' | 'info' | 'default'> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'default',
  }

  const variant = variantMap[normPriority] || 'default'

  return (
    <Badge variant={variant} size={size} dot className={className}>
      {formatPriority(normPriority)}
    </Badge>
  )
}
