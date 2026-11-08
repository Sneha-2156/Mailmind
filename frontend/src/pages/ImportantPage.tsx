import React, { useEffect, useState } from 'react'
import { Star, ShieldAlert, ArrowLeft } from 'lucide-react'
import { emailsApi } from '@/api/emails'
import type { Email } from '@/types'
import { EmailList } from '@/components/email/EmailList'
import { EmailDetail } from '@/components/email/EmailDetail'
import { useToast } from '@/hooks/useToast'

export const ImportantPage: React.FC = () => {
  const toast = useToast()
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadImportant = async () => {
    setIsLoading(true)
    try {
      const res = await emailsApi.listEmails({ is_important: true, page_size: 50 })
      setEmails(res.data.items)
    } catch {
      toast.error('Failed to load important emails.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadImportant()
  }, [])

  const handleSelectEmail = async (email: Email) => {
    try {
      const res = await emailsApi.getEmail(email.id)
      setSelectedEmail(res.data)
    } catch {
      toast.error('Failed to load email details.')
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Important Inflow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Emails flagged with high priority, impending deadlines, or starred by you.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto ${
            selectedEmail ? 'hidden lg:block lg:max-w-md lg:border-r lg:border-slate-200 dark:lg:border-slate-800' : 'w-full'
          }`}
        >
          <EmailList
            emails={emails}
            selectedId={selectedEmail?.id}
            isLoading={isLoading}
            onEmailClick={handleSelectEmail}
            onMarkRead={(id) => {
              emailsApi.markRead(id)
              setEmails(emails.map((e) => (e.id === id ? { ...e, is_read: true } : e)))
            }}
            onMarkImportant={(id) => {
              setEmails(emails.filter((e) => e.id !== id))
              emailsApi.markImportant(id, false)
            }}
            emptyMessage="No important emails flagged right now."
          />
        </div>

        {selectedEmail ? (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onUpdateEmail={(id, updates) => {
                setSelectedEmail({ ...selectedEmail, ...updates })
              }}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center p-8 text-center text-slate-400">
            <div className="max-w-xs space-y-2">
              <Star className="w-8 h-8 text-amber-500/40 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Select an important message
              </p>
              <p className="text-xs text-slate-400">
                Review high-priority notices, academic schedules, and career notifications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
