import React from 'react'

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md shimmer-effect ${
            i === lines - 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={`rounded-full bg-slate-200 dark:bg-slate-700/60 shrink-0 shimmer-effect ${sizeMap[size]} ${className}`}
    />
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700/60 rounded-full shimmer-effect" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
      </div>
    </div>
  )
}

export const SkeletonEmailCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-850/40 flex items-start gap-3.5 ${className}`}
    >
      <SkeletonAvatar size="md" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
        </div>
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
        <div className="h-3.5 w-11/12 bg-slate-200 dark:bg-slate-700/60 rounded shimmer-effect" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-full shimmer-effect" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700/60 rounded-full shimmer-effect" />
        </div>
      </div>
    </div>
  )
}
