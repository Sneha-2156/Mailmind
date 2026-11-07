import React from 'react'
import { formatCategory } from '@/utils/format'

export interface CategoryBadgeProps {
  category: string | null | undefined
  size?: 'sm' | 'md'
  className?: string
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'sm',
  className = '',
}) => {
  const normCategory = (category || 'Miscellaneous').trim()

  const getColorClasses = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'academic':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
      case 'administration':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50'
      case 'campus service':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800/50'
      case 'career and opportunity':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
      case 'financial services':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
      case 'service notification':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/50'
      case 'scholarship':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
      case 'skill development':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800/50'
      case 'miscellaneous':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border leading-none transition-colors ${sizeClasses[size]} ${getColorClasses(
        normCategory
      )} ${className}`}
    >
      {formatCategory(normCategory)}
    </span>
  )
}
