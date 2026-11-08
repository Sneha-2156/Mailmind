import { gmailApi } from '@/api/gmail'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Inbox,
  Star,
  CheckSquare,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { emailsApi } from '@/api/emails'
import { tasksApi } from '@/api/tasks'
import { opportunitiesApi } from '@/api/opportunities'
import { analyticsApi } from '@/api/analytics'
import type { Email, Task, Opportunity, AnalyticsSummary } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PriorityBadge } from '@/components/email/PriorityBadge'
import { CategoryBadge } from '@/components/email/CategoryBadge'
import { formatEmailDate } from '@/utils/date'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [recentEmails, setRecentEmails] = useState<Email[]>([])
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [recentOpps, setRecentOpps] = useState<Opportunity[]>([])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [sumRes, emailsRes, tasksRes, oppsRes] = await Promise.all([
        analyticsApi.getSummary(),
        emailsApi.listEmails({ page: 1, page_size: 5 }),
        tasksApi.listTasks({ is_completed: false }),
        opportunitiesApi.listOpportunities(),
      ])
      setSummary(sumRes.data)
      setRecentEmails(emailsRes.data.items)
      setPendingTasks(tasksRes.data.slice(0, 4))
      setRecentOpps(oppsRes.data.slice(0, 3))
    } catch {
      toast.error('Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await emailsApi.listEmails() // verify connection
      const { data } = await gmailApi.syncEmails()
      toast.success(
        `${data.mode === 'demo' ? 'Demo sync' : 'Sync'} complete: ${data.synced_count || 0} emails processed`
      )
      loadDashboardData()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Sync failed. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Greeting & Quick Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your daily intelligence briefing across emails, upcoming tasks, and career opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Inbox'}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/inbox')}
            className="flex items-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            Open Inbox
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unread Emails
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.unread_emails ?? 0}
            </span>
            <span className="text-xs text-slate-400">/ {summary?.total_emails ?? 0} total</span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Tasks
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.pending_tasks ?? 0}
            </span>
            <span className="text-xs text-amber-500 font-medium">due soon</span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Opportunities
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.total_opportunities ?? 0}
            </span>
            <span className="text-xs text-emerald-500 font-medium">
              +{summary?.new_opportunities ?? 0} new
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Deadlines (7d)
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary?.upcoming_deadlines_7d ?? 0}
            </span>
            <span className="text-xs text-rose-500 font-medium">action required</span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Split: Recent Emails vs Tasks & Career Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Intelligence Emails */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Recent Intelligent Inflow
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inbox')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
            {recentEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No emails found. Click "Sync Inbox" to pull your emails!
              </div>
            ) : (
              recentEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => navigate(`/inbox?id=${email.id}`)}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${!email.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {email.sender_name || email.sender_email}
                      </span>
                      <PriorityBadge priority={email.priority} />
                      {email.category && <CategoryBadge category={email.category} />}
                    </div>
                    <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {email.subject || '(No subject)'}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-1">{email.snippet}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatEmailDate(email.received_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Extracted Tasks & Career Opportunities */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                Action Items
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="text-xs text-indigo-500 hover:text-indigo-400"
              >
                Manage
              </Button>
            </div>

            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <Card className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  No pending tasks! All caught up.
                </Card>
              ) : (
                pendingTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-start gap-2.5 shadow-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> Due {formatEmailDate(task.due_date)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Career Highlights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                Opportunities
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/opportunities')}
                className="text-xs text-indigo-500 hover:text-indigo-400"
              >
                Explore
              </Button>
            </div>

            <div className="space-y-2">
              {recentOpps.length === 0 ? (
                <Card className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  No opportunities detected yet. Sync your inbox to discover them.
                </Card>
              ) : (
                recentOpps.map((opp) => (
                  <Card
                    key={opp.id}
                    className="p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {opp.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-500 border-emerald-500/30">
                        {opp.opportunity_type}
                      </Badge>
                    </div>
                    {opp.company && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{opp.company}</p>
                    )}
                    {opp.stipend && (
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {opp.stipend}
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
