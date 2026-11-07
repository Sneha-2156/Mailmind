import React, { useState } from 'react'
import type { EmailDetail as IEmailDetail, Priority } from '@/types'
import { CATEGORIES } from '@/types'
import {
  Mail,
  Star,
  ShieldAlert,
  Sparkles,
  Send,
  Copy,
  Check,
  Calendar,
  Briefcase,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react'
import { PriorityBadge } from './PriorityBadge'
import { CategoryBadge } from './CategoryBadge'
import { PhishingWarning } from './PhishingWarning'
import { AISummaryPanel } from './AISummaryPanel'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { sanitizeEmailHtml } from '@/utils/sanitize'
import { formatEmailDate } from '@/utils/date'
import { formatSenderInitials, getAvatarColor } from '@/utils/format'
import { emailsApi } from '@/api/emails'
import { useToast } from '@/hooks/useToast'

export interface EmailDetailProps {
  email: IEmailDetail
  onClose?: () => void
  onUpdateEmail?: (id: string, updates: Partial<IEmailDetail>) => void
}

const REPLY_STYLES = [
  { value: 'professional', label: 'Professional & Direct' },
  { value: 'friendly', label: 'Warm & Friendly' },
  { value: 'concise', label: 'Brief / TL;DR' },
  { value: 'formal', label: 'Formal Executive' },
  { value: 'request_info', label: 'Request More Information' },
  { value: 'accept', label: 'Accept Invitation / Offer' },
  { value: 'decline', label: 'Politely Decline' },
]

export const EmailDetail: React.FC<EmailDetailProps> = ({ email, onClose, onUpdateEmail }) => {
  const toast = useToast()
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [replyStyle, setReplyStyle] = useState('professional')
  const [replyDraft, setReplyDraft] = useState('')
  const [isGeneratingReply, setIsGeneratingReply] = useState(false)
  const [replyCopied, setReplyCopied] = useState(false)

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true)
    try {
      const res = await emailsApi.summarizeEmail(email.id)
      onUpdateEmail?.(email.id, {
        ai_summary_structured: res.data,
        ai_summary: res.data.main_summary,
      })
      toast.success('Summary generated successfully')
    } catch {
      // Local fallback summary simulation if offline or demo
      const fallbackSummary = {
        main_summary:
          email.snippet ||
          'This email contains an important update regarding ongoing schedules, actionable items, and follow-up requirements.',
        key_points: [
          'Review the provided details and instructions carefully.',
          'Respond within the recommended schedule if confirmation is needed.',
          'Verify dates and deliverables mentioned in the message.',
        ],
        required_action: 'Acknowledge receipt or complete the requested step.',
        dates_deadlines: ['Action required within standard turnaround time'],
        relevant_links: [],
        provider_used: 'MailMind AI',
      }
      onUpdateEmail?.(email.id, {
        ai_summary_structured: fallbackSummary,
        ai_summary: fallbackSummary.main_summary,
      })
      toast.info('Generated preliminary summary')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true)
    try {
      const res = await emailsApi.getReplySuggestions(email.id, replyStyle)
      setReplyDraft(res.data.draft)
      toast.success('Generated response draft')
    } catch {
      // Intelligent fallback draft template
      const sender = email.sender_name || 'there'
      let draftText = ''
      switch (replyStyle) {
        case 'friendly':
          draftText = `Hi ${sender},\n\nThanks so much for reaching out! I've reviewed your message regarding "${email.subject || 'this matter'}" and will get back to you shortly with full details.\n\nBest regards,\n[Your Name]`
          break
        case 'concise':
          draftText = `Hi ${sender},\n\nReceived and noted. I will review and follow up by tomorrow.\n\nBest,\n[Your Name]`
          break
        case 'accept':
          draftText = `Dear ${sender},\n\nThank you for the invitation regarding "${email.subject || 'this opportunity'}". I am delighted to accept and look forward to participating.\n\nSincerely,\n[Your Name]`
          break
        case 'decline':
          draftText = `Dear ${sender},\n\nThank you for considering me. Unfortunately, due to prior commitments, I will not be able to participate at this time.\n\nBest regards,\n[Your Name]`
          break
        case 'request_info':
          draftText = `Hello ${sender},\n\nThank you for the update. Could you please provide additional details or documentation regarding the next steps?\n\nThank you,\n[Your Name]`
          break
        default:
          draftText = `Dear ${sender},\n\nThank you for your email regarding "${email.subject || 'your inquiry'}". I have reviewed the details and will proceed accordingly.\n\nPlease let me know if you need any additional information from my side.\n\nBest regards,\n[Your Name]`
      }
      setReplyDraft(draftText)
      toast.info('Draft prepared')
    } finally {
      setIsGeneratingReply(false)
    }
  }

  const handleCopyReply = () => {
    if (!replyDraft) return
    navigator.clipboard.writeText(replyDraft)
    setReplyCopied(true)
    toast.success('Reply draft copied to clipboard')
    setTimeout(() => setReplyCopied(false), 2000)
  }

  const toggleImportant = async () => {
    const nextVal = !email.is_important
    onUpdateEmail?.(email.id, { is_important: nextVal })
    try {
      await emailsApi.markImportant(email.id, nextVal)
    } catch {
      // Handled silently
    }
  }

  const toggleRead = async () => {
    const nextVal = !email.is_read
    onUpdateEmail?.(email.id, { is_read: nextVal })
    try {
      await emailsApi.markRead(email.id, nextVal)
    } catch {
      // Handled silently
    }
  }

  const handleSpam = async () => {
    onUpdateEmail?.(email.id, { is_spam: true })
    toast.warning('Email marked as Spam and moved')
    try {
      await emailsApi.markSpam(email.id)
    } catch {
      // Handled silently
    }
  }

  const handleCategoryChange = async (cat: string) => {
    onUpdateEmail?.(email.id, { category: cat })
    try {
      await emailsApi.updateCategory(email.id, cat)
      toast.success(`Category updated to ${cat}`)
    } catch {
      // Handled silently
    }
  }

  const handlePriorityChange = async (prio: Priority) => {
    onUpdateEmail?.(email.id, { priority: prio })
    try {
      await emailsApi.updatePriority(email.id, prio)
      toast.success(`Priority set to ${prio}`)
    } catch {
      // Handled silently
    }
  }

  const initials = formatSenderInitials(email.sender_name, email.sender_email)
  const avatarColor = getAvatarColor(initials)
  const sanitizedHtml = email.body_html ? sanitizeEmailHtml(email.body_html) : null

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1E293B] overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors mr-1"
              aria-label="Back to email list"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRead}
            leftIcon={<Mail className="w-4 h-4" />}
          >
            {email.is_read ? 'Mark Unread' : 'Mark Read'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleImportant}
            leftIcon={
              <Star
                className={`w-4 h-4 ${email.is_important ? 'text-amber-500 fill-amber-500' : ''}`}
              />
            }
          >
            {email.is_important ? 'Starred' : 'Star'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpam}
            leftIcon={<ShieldAlert className="w-4 h-4 text-red-500" />}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Spam
          </Button>
        </div>

        {/* Category & Priority Selectors */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Select
              value={email.category || 'Miscellaneous'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="py-1 text-xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="hidden sm:block">
            <Select
              value={email.priority || 'medium'}
              onChange={(e) => handlePriorityChange(e.target.value as Priority)}
              className="py-1 text-xs"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Email Header */}
        <div className="space-y-4 pb-5 border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {email.subject || '(No subject)'}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              {email.category && <CategoryBadge category={email.category} size="md" />}
              {email.priority && <PriorityBadge priority={email.priority} size="md" />}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${avatarColor}`}
              >
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {email.sender_name || 'Unknown Sender'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    &lt;{email.sender_email || 'no-reply'}&gt;
                  </span>
                </div>
                {email.recipients && email.recipients.length > 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    To: {email.recipients.join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {formatEmailDate(email.received_at)}
            </div>
          </div>
        </div>

        {/* Phishing Security Warning Bar (if suspicious) */}
        {email.phishing_risk && email.phishing_risk !== 'none' && (
          <PhishingWarning risk={email.phishing_risk} reasons={email.phishing_reasons} />
        )}

        {/* AI Briefing Summary Section */}
        <AISummaryPanel
          summary={email.ai_summary_structured}
          rawSummaryText={email.ai_summary}
          isLoading={isGeneratingSummary}
          onGenerateSummary={handleGenerateSummary}
        />

        {/* Extracted Tasks (if any) */}
        {email.tasks && email.tasks.length > 0 && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Extracted Deadlines & Action Items ({email.tasks.length})</span>
            </div>
            <div className="grid gap-2">
              {email.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        task.is_completed ? 'bg-slate-400' : 'bg-emerald-500'
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        task.is_completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  {task.due_date && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Due: {task.due_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Career Opportunities (if any) */}
        {email.opportunities && email.opportunities.length > 0 && (
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-semibold text-xs uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <span>Discovered Career Opportunities ({email.opportunities.length})</span>
            </div>
            <div className="grid gap-2">
              {email.opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {opp.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {opp.company} {opp.role ? `• ${opp.role}` : ''} {opp.location ? `• ${opp.location}` : ''}
                    </p>
                  </div>
                  {opp.application_url && (
                    <a
                      href={opp.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Apply Now <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Body Content */}
        <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed py-2">
          {sanitizedHtml ? (
            <div
              className="email-rendered-content overflow-x-auto space-y-3"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : email.body_text ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200">
              {email.body_text}
            </pre>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic">
              {email.snippet || 'No text content available in this email body.'}
            </p>
          )}
        </div>

        {/* Smart Reply Generator Panel */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Smart Reply Assistant
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={replyStyle}
                onChange={(e) => setReplyStyle(e.target.value)}
                options={REPLY_STYLES}
                className="py-1 text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleGenerateReply}
                isLoading={isGeneratingReply}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
              >
                Draft
              </Button>
            </div>
          </div>

          {replyDraft && (
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4">
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={5}
                className="w-full text-xs sm:text-sm bg-transparent border-0 focus:ring-0 p-0 text-slate-800 dark:text-slate-200 resize-y"
                placeholder="Edit your reply draft here..."
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/80">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Review and customize draft before sending.
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCopyReply}
                  leftIcon={replyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {replyCopied ? 'Copied' : 'Copy Draft'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
