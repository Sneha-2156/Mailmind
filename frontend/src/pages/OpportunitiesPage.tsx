import React, { useEffect, useState } from 'react'
import {
  Briefcase,
  ExternalLink,
  Calendar,
  DollarSign,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import { opportunitiesApi } from '@/api/opportunities'
import type { Opportunity, OpportunityStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { formatEmailDate } from '@/utils/date'

const PIPELINE_STATUSES: { id: OpportunityStatus; label: string }[] = [
  { id: 'new', label: 'New / Detected' },
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interview', label: 'Interviewing' },
  { id: 'offer', label: 'Offers Received' },
  { id: 'rejected', label: 'Closed' },
]

export const OpportunitiesPage: React.FC = () => {
  const toast = useToast()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const loadOpportunities = async () => {
    setIsLoading(true)
    try {
      const res = await opportunitiesApi.listOpportunities()
      setOpportunities(res.data)
    } catch {
      toast.error('Failed to load opportunities.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOpportunities()
  }, [])

  const handleStatusChange = async (oppId: string, newStatus: OpportunityStatus) => {
    try {
      const res = await opportunitiesApi.updateStatus(oppId, newStatus)
      setOpportunities(opportunities.map((o) => (o.id === oppId ? res.data : o)))
      toast.success(`Pipeline status updated to ${newStatus}!`)
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const filtered = opportunities.filter((opp) => {
    if (selectedStatus !== 'all' && opp.status !== selectedStatus) return false
    if (selectedType !== 'all' && opp.opportunity_type !== selectedType) return false
    return true
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            Student & Career Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Internships, campus placements, fellowships, and scholarships detected automatically from your inbox.
          </p>
        </div>

        {/* Opportunity Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          >
            <option value="all">All Opportunity Types</option>
            <option value="internship">Internships</option>
            <option value="placement">Campus Placements</option>
            <option value="scholarship">Scholarships & Grants</option>
            <option value="hackathon">Hackathons</option>
            <option value="academic">Academic Notices</option>
          </select>
        </div>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedStatus === 'all'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Pipeline ({opportunities.length})
        </button>
        {PIPELINE_STATUSES.map((status) => {
          const count = opportunities.filter((o) => o.status === status.id).length
          const isSelected = selectedStatus === status.id
          return (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{status.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                No opportunities in this pipeline stage
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                As emails regarding internships, campus recruitment, and scholarships arrive in your inbox, MailMind AI extracts them here automatically.
              </p>
            </Card>
          </div>
        ) : (
          filtered.map((opp) => (
            <Card
              key={opp.id}
              className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {opp.company || 'Campus Program'}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                      {opp.title}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-500 border-emerald-500/30">
                    {opp.opportunity_type}
                  </Badge>
                </div>

                {opp.stipend && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {opp.stipend}
                  </div>
                )}

                {opp.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {formatEmailDate(opp.deadline)}
                  </div>
                )}

                {opp.skills_required && opp.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.skills_required.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions: Pipeline Status Selector & External Link */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                  <select
                    value={opp.status}
                    onChange={(e) => handleStatusChange(opp.id, e.target.value as OpportunityStatus)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-md px-2 py-1 text-slate-700 dark:text-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Closed</option>
                  </select>
                </div>

                {opp.application_url && (
                  <a
                    href={opp.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                  >
                    Apply Now <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
