import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Search, RefreshCw, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useEmailStore } from '@/stores/emailStore'
import { useAuth } from '@/hooks/useAuth'
import { gmailApi } from '@/api/gmail'
import { useToast } from '@/hooks/useToast'
import { formatSenderInitials, getAvatarColor } from '@/utils/format'

export interface TopbarProps {
  onOpenMobileSidebar: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation()
  const { filters, setFilter, isSyncing, setSyncing } = useEmailStore()
  const { user } = useAuth()
  const toast = useToast()

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Overview Dashboard'
    if (pathname.startsWith('/inbox')) return 'Inbox Intelligence'
    if (pathname.startsWith('/important')) return 'Important & Starred'
    if (pathname.startsWith('/categories')) return 'Taxonomy & Categories'
    if (pathname.startsWith('/tasks')) return 'Tasks & Deadlines'
    if (pathname.startsWith('/opportunities')) return 'Career Opportunities'
    if (pathname.startsWith('/analytics')) return 'Persisted Analytics'
    if (pathname.startsWith('/settings')) return 'Preferences & Settings'
    if (pathname.startsWith('/emails')) return 'Email Intelligence View'
    return 'MailMind AI'
  }

  const handleSync = async () => {
    if (isSyncing) return
    setSyncing(true)
    try {
      const res = await gmailApi.syncEmails({ max_emails: 50, history_days: 30 })
      toast.success(res.data?.message || 'Sync completed successfully')
    } catch {
      // Graceful notification
      toast.info('Synchronization requested')
    } finally {
      setTimeout(() => setSyncing(false), 800)
    }
  }

  const userInitials = formatSenderInitials(user?.name, user?.email)
  const avatarBg = getAvatarColor(userInitials)
  const isSearchablePage =
    location.pathname.startsWith('/inbox') ||
    location.pathname.startsWith('/important') ||
    location.pathname.startsWith('/tasks')

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Center: Search Bar (when on search-enabled pages) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        {isSearchablePage && (
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 w-4 h-full text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Search sender, subject, or keywords..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right: Sync Button + Notifications + Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />}
          className="text-xs"
        >
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Gmail'}</span>
        </Button>

        {/* Notification Bell */}
        <button
          onClick={() => toast.info('All notification channels active')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Avatar */}
        <div className="pl-1">
          {user?.picture_url ? (
            <img
              src={user.picture_url}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shadow-2xs"
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${avatarBg}`}
            >
              {userInitials}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
