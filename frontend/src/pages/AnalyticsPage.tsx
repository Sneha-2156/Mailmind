import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { BarChart2, ShieldCheck, Zap, Activity } from 'lucide-react'
import { analyticsApi, CategoryDistributionItem, PriorityDistributionItem, WeeklyActivityItem } from '@/api/analytics'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'

const CATEGORY_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#94A3B8', // Slate
]

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#3B82F6',
  low: '#94A3B8',
}

export const AnalyticsPage: React.FC = () => {
  const toast = useToast()
  const [categories, setCategories] = useState<CategoryDistributionItem[]>([])
  const [priorities, setPriorities] = useState<PriorityDistributionItem[]>([])
  const [activity, setActivity] = useState<WeeklyActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.getCategoryDistribution(),
      analyticsApi.getPriorityDistribution(),
      analyticsApi.getWeeklyActivity(),
    ])
      .then(([catRes, prioRes, actRes]) => {
        setCategories(catRes.data)
        setPriorities(prioRes.data)
        setActivity(actRes.data)
      })
      .catch(() => toast.error('Failed to load analytics metrics.'))
      .finally(() => setIsLoading(false))
  }, [])

  const totalClassified = categories.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-500" />
          Intelligence Analytics & Metrics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time telemetry, model classification distribution, and priority dynamics calculated from your database.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Zap className="w-4 h-4 text-indigo-500" />
            Classified Inflow
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalClassified} <span className="text-xs font-normal text-slate-400">emails</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Processed across 9 ML categories</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Model Calibration
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            78% <span className="text-xs font-normal text-slate-400">test accuracy</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">CalibratedClassifierCV (LinearSVC)</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Activity className="w-4 h-4 text-indigo-500" />
            Extraction Precision
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            100% <span className="text-xs font-normal text-slate-400">automated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tasks, deadlines & opportunities</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Bar Chart) */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-400">Relative volume across functional categories</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown (Bar Chart) */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Priority Distribution
            </h3>
            <p className="text-xs text-slate-400">Calculated multi-signal priority levels</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorities} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorities.map((entry, index) => (
                    <Cell
                      key={`prio-cell-${index}`}
                      fill={PRIORITY_COLORS[entry.priority.toLowerCase()] || '#6366F1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 7-Day Activity Trend */}
        <Card className="col-span-full p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Email Inflow Activity
            </h3>
            <p className="text-xs text-slate-400">Daily synchronized email message frequency</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#activityColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
