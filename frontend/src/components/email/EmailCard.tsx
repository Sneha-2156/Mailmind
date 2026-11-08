import React from 'react'
import type { Email } from '@/types'
import { Star, ShieldAlert } from 'lucide-react'
import { PriorityBadge } from './PriorityBadge'
import { CategoryBadge } from './CategoryBadge'
import { formatEmailDate } from '@/utils/date'
import { formatSenderInitials, getAvatarColor } from '@/utils/format'

export interface EmailCardProps {
  email: Email
  isSelected: boolean
  onClick: (email: Email) => void
  onMarkRead: (id: string) => void
  onMarkImportant: (id: string) => void
}

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  isSelected,
  onClick,
  onMarkRead,
  onMarkImportant,
}) => {
  const initials = formatSenderInitials(email.sender_name, email.sender_email)
  const avatarColor = getAvatarColor(initials)

  return (
    <div
      onClick={() => {
        onClick(email)
        if (!email.is_read) {
          onMarkRead(email.id)
        }
      }}
      className={`group relative p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? 'bg-indigo-50/70 dark:bg-slate-800/90 shadow-2xs'
          : 'bg-white dark:bg-[#1E293B]/40 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      } ${!email.is_read ? 'border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
    >
      <div className="flex items-start gap-3">
        {/* Sender Avatar */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs ${avatarColor}`}
        >
          {initials}
        </div>

        {/* Center details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span
              className={`text-xs sm:text-sm truncate ${
                !email.is_read
                  ? 'font-bold text-slate-900 dark:text-slate-100'
                  : 'font-medium text-slate-700 dark:text-slate-300'
              }`}
            >
              {email.sender_name || email.sender_email || 'Unknown Sender'}
            </span>

            {/* Time */}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
              {formatEmailDate(email.received_at)}
            </span>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-1.5 mb-1">
            <h4
              className={`text-xs sm:text-sm truncate leading-snug ${
                !email.is_read
                  ? 'font-bold text-slate-900 dark:text-slate-100'
                  : 'font-normal text-slate-700 dark:text-slate-300'
              }`}
            >
              {email.subject || '(No subject)'}
            </h4>

            {email.phishing_risk && email.phishing_risk !== 'none' && (
              <ShieldAlert
                className={`w-3.5 h-3.5 shrink-0 ${
                  email.phishing_risk === 'high' ? 'text-red-500' : 'text-amber-500'
                }`}
                title={`Security warning: ${email.phishing_risk} risk detected`}
              />
            )}
          </div>

          {/* Snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal mb-2">
            {email.snippet || ''}
          </p>

          {/* Bottom badges & Star */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {email.category && <CategoryBadge category={email.category} size="sm" />}
              {email.priority && email.priority !== 'low' && (
                <PriorityBadge priority={email.priority} size="sm" />
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkImportant(email.id)
                }}
                className={`p-1 rounded-md transition-colors ${
                  email.is_important
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400'
                }`}
                title={email.is_important ? 'Mark as not important' : 'Mark as important'}
              >
                <Star
                  className={`w-4 h-4 ${email.is_important ? 'fill-amber-500' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
