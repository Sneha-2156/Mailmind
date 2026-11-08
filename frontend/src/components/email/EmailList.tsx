import React from 'react'
import type { Email } from '@/types'
import { EmailCard } from './EmailCard'
import { SkeletonEmailCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox } from 'lucide-react'

export interface EmailListProps {
  emails: Email[]
  selectedId?: string
  isLoading: boolean
  onEmailClick: (email: Email) => void
  onMarkRead: (id: string) => void
  onMarkImportant: (id: string) => void
  emptyMessage?: string
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedId,
  isLoading,
  onEmailClick,
  onMarkRead,
  onMarkImportant,
  emptyMessage = 'No emails found in this view',
}) => {
  if (isLoading) {
    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonEmailCard key={i} />
        ))}
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Inbox className="w-6 h-6" />}
          title="Inbox Zero"
          description={emptyMessage}
        />
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          isSelected={email.id === selectedId}
          onClick={onEmailClick}
          onMarkRead={onMarkRead}
          onMarkImportant={onMarkImportant}
        />
      ))}
    </div>
  )
}
