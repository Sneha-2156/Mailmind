import React, { useEffect, useState } from 'react'
import { Tag, Mail, ArrowRight } from 'lucide-react'
import { CATEGORIES } from '@/types'
import { CategoryBadge } from '@/components/email/CategoryBadge'
import { EmailList } from '@/components/email/EmailList'
import { EmailDetail } from '@/components/email/EmailDetail'
import { emailsApi } from '@/api/emails'
import { analyticsApi } from '@/api/analytics'
import type { Email } from '@/types'
import { useToast } from '@/hooks/useToast'
import { Card } from '@/components/ui/Card'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Academic: 'Course syllabi, lecture schedules, exam notices, and professor communications.',
  Administration: 'University registrar, policy announcements, department memos, and ID services.',
  'Campus Service': 'Hostel, campus amenities, facility notifications, and dining halls.',
  'Career and Opportunity': 'Internship opportunities, campus placements, job offers, and career fairs.',
  'Financial Services': 'Tuition statements, fee reminders, student banking, and refund receipts.',
  'Service Notification': 'System maintenance, password updates, software notices, and outages.',
  Scholarship: 'Merit scholarships, need-based grants, fellowships, and research funding.',
  'Skill Development': 'Bootcamps, technical workshops, certification programs, and hackathons.',
  Miscellaneous: 'General communications, campus events, surveys, and non-academic notices.',
}

export const CategoriesPage: React.FC = () => {
  const toast = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string>('Career and Opportunity')
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load category breakdown counts
    analyticsApi.getCategoryDistribution().then((res) => {
      const counts: Record<string, number> = {}
      res.data.forEach((item) => {
        counts[item.category] = item.count
      })
      setCategoryCounts(counts)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setSelectedEmail(null)
    emailsApi
      .listEmails({ category: selectedCategory, page_size: 50 })
      .then((res) => setEmails(res.data.items))
      .catch(() => toast.error(`Failed to load emails for ${selectedCategory}`))
      .finally(() => setIsLoading(false))
  }, [selectedCategory])

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
      {/* Category Pills Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Taxonomy & Categories</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Machine learning classifier taxonomy across 9 distinct functional domains.
            </p>
          </div>
        </div>

        {/* Categories Horizontal Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            const count = categoryCounts[cat] || 0
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Email View for Selected Category */}
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto ${
            selectedEmail ? 'hidden lg:block lg:max-w-md lg:border-r lg:border-slate-200 dark:lg:border-slate-800' : 'w-full'
          }`}
        >
          {/* Category Banner Description */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100/60 dark:border-indigo-900/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300">
                {selectedCategory}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {CATEGORY_DESCRIPTIONS[selectedCategory] || 'Email domain classification.'}
              </p>
            </div>
            <CategoryBadge category={selectedCategory} />
          </div>

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
              emailsApi.markImportant(id, true)
              setEmails(emails.map((e) => (e.id === id ? { ...e, is_important: true } : e)))
            }}
            emptyMessage={`No emails currently categorized under ${selectedCategory}.`}
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
              <Tag className="w-8 h-8 text-indigo-400/40 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Category Inspection
              </p>
              <p className="text-xs text-slate-400">
                Select an email to view its Calibrated LinearSVC confidence score and top indicative terms.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
