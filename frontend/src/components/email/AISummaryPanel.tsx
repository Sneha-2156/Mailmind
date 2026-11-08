import React, { useState } from 'react'
import type { AISummary } from '@/types'
import { Sparkles, Calendar, CheckSquare, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonText } from '@/components/ui/Skeleton'

export interface AISummaryPanelProps {
  summary: AISummary | null | undefined
  rawSummaryText?: string | null
  isLoading?: boolean
  onGenerateSummary?: () => void
  aiConfigured?: boolean
}

export const AISummaryPanel: React.FC<AISummaryPanelProps> = ({
  summary,
  rawSummaryText,
  isLoading = false,
  onGenerateSummary,
  aiConfigured = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = () => {
    const textToCopy = summary
      ? `${summary.main_summary}\n\nKey Points:\n${summary.key_points.map((p) => `• ${p}`).join('\n')}${
          summary.required_action ? `\n\nRequired Action: ${summary.required_action}` : ''
        }`
      : rawSummaryText || ''

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // If loading
  if (isLoading) {
    return (
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-4">
        <div className="flex items-center gap-2 text-indigo-500 font-medium text-sm">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Generating intelligent AI summary...</span>
        </div>
        <SkeletonText lines={3} />
      </div>
    )
  }

  // If no summary available yet
  if (!summary && !rawSummaryText) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              AI Email Intelligence
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {aiConfigured
                ? 'Generate a synthesized briefing with extracted action items and deadlines.'
                : 'Configure an AI provider (Gemini or OpenAI) in Settings to enable automated summarization.'}
            </p>
          </div>
        </div>

        {onGenerateSummary && (
          <Button
            size="sm"
            variant="primary"
            onClick={onGenerateSummary}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate Briefing
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/30 via-slate-50/20 to-transparent dark:from-indigo-950/30 dark:via-slate-850/30 dark:to-transparent overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/40">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            MailMind Executive Briefing
          </span>
          {summary?.provider_used && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500">
              {summary.provider_used}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
            aria-label={isOpen ? 'Collapse summary' : 'Expand summary'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Main summary */}
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
            {summary ? summary.main_summary : rawSummaryText}
          </p>

          {/* Key points */}
          {summary?.key_points && summary.key_points.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Key Takeaways
              </span>
              <ul className="space-y-1 pl-4 list-disc text-slate-700 dark:text-slate-300">
                {summary.key_points.map((pt, i) => (
                  <li key={i} className="leading-relaxed">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required action callout */}
          {summary?.required_action && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-emerald-800 dark:text-emerald-300">
                  Required Action:
                </span>
                <span className="text-emerald-700 dark:text-emerald-200">
                  {summary.required_action}
                </span>
              </div>
            </div>
          )}

          {/* Dates & deadlines */}
          {summary?.dates_deadlines && summary.dates_deadlines.length > 0 && (
            <div className="flex items-start gap-2 pt-1 text-slate-600 dark:text-slate-400 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">
                  Dates & Deadlines:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {summary.dates_deadlines.join(' • ')}
                </span>
              </div>
            </div>
          )}

          {/* Safe links */}
          {summary?.relevant_links && summary.relevant_links.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {summary.relevant_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="max-w-xs truncate">{link}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
