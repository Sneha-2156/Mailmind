import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  actions,
  hover = false,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }

  const hoverClass = hover
    ? 'hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200 cursor-pointer'
    : ''

  return (
    <div
      className={`bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs ${hoverClass} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1">
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
