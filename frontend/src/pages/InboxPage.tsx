import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  RefreshCw,
  Mail,
  Star,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Inbox as InboxIcon,
  X,
} from 'lucide-react'
import { useEmails } from '@/hooks/useEmails'
import { useEmailStore } from '@/stores/emailStore'
import { useToast } from '@/hooks/useToast'
import { emailsApi } from '@/api/emails'
import { EmailList } from '@/components/email/EmailList'
import { EmailDetail } from '@/components/email/EmailDetail'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CATEGORIES } from '@/types'
import type { Email, Priority } from '@/types'

export const InboxPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const { isLoading, fetchEmails, markAsRead, markAsImportant } = useEmails()
  const { emails, selectedEmail, setSelectedEmail, filters, setFilter, pagination, isSyncing, setSyncing } =
    useEmailStore()

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred' | 'spam'>('all')

  // Check URL query param ?id=xxx to auto-open email
  useEffect(() => {
    const emailId = searchParams.get('id')
    if (emailId && (!selectedEmail || selectedEmail.id !== emailId)) {
      emailsApi.getEmail(emailId).then((res) => {
        setSelectedEmail(res.data)
      }).catch(() => {})
    }
  }, [searchParams])

  const handleSelectEmail = async (email: Email) => {
    try {
      const res = await emailsApi.getEmail(email.id)
      setSelectedEmail(res.data)
      setSearchParams({ id: email.id })
      if (!email.is_read) {
        markAsRead(email.id, true)
      }
    } catch {
      toast.error('Failed to load email details.')
    }
  }

  const handleCloseDetail = () => {
    setSelectedEmail(null)
    setSearchParams({})
  }

  const handleTabChange = (tab: 'all' | 'unread' | 'starred' | 'spam') => {
    setActiveTab(tab)
    if (tab === 'all') {
      setFilter({ is_read: undefined, is_important: undefined, is_spam: false })
    } else if (tab === 'unread') {
      setFilter({ is_read: false, is_important: undefined, is_spam: false })
    } else if (tab === 'starred') {
      setFilter({ is_read: undefined, is_important: true, is_spam: false })
    } else if (tab === 'spam') {
      setFilter({ is_read: undefined, is_important: undefined, is_spam: true })
    }
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const syncRes = await fetch(
        (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/v1/emails/sync',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      )
      const data = await syncRes.json()
      toast.success(`Sync complete: ${data.synced_count || 0} emails processed!`)
      fetchEmails(1)
    } catch {
      toast.error('Sync failed. Please check connection.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
      {/* Search & Action Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search emails by sender, subject, or content..."
            value={filters.search || ''}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={filters.category || ''}
            onChange={(e) => setFilter({ category: e.target.value || undefined })}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilter({ priority: (e.target.value as Priority) || undefined })}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Refresh / Sync */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Filter Tabs: All, Unread, Starred, Spam */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            All Inflow
          </button>
          <button
            onClick={() => handleTabChange('unread')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'unread'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => handleTabChange('starred')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'starred'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Starred
          </button>
          <button
            onClick={() => handleTabChange('spam')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'spam'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Spam
          </button>
        </div>

        {/* Pagination Status */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.pageSize + 1}-${Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )} of ${pagination.total}`
              : '0 emails'}
          </span>
          <div className="flex items-center">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchEmails(pagination.page - 1)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => fetchEmails(pagination.page + 1)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split View when Email is Selected */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List Column */}
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
            onMarkRead={markAsRead}
            onMarkImportant={markAsImportant}
            emptyMessage={
              activeTab === 'spam'
                ? 'No spam detected in your inbox!'
                : 'No emails match your current search and filters.'
            }
          />
        </div>

        {/* Email Detail Column */}
        {selectedEmail ? (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            <EmailDetail
              email={selectedEmail}
              onClose={handleCloseDetail}
              onUpdateEmail={(id, updates) => {
                setSelectedEmail({ ...selectedEmail, ...updates })
              }}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center p-8 text-center text-slate-400">
            <div className="max-w-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <InboxIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No email selected
              </p>
              <p className="text-xs text-slate-400">
                Select an email from the left pane to view its classification, AI summary, and action items.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
