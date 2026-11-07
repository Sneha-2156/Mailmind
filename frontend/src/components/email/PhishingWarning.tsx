import React, { useState } from 'react'
import type { PhishingRisk } from '@/types'
import { ShieldAlert, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

export interface PhishingWarningProps {
  risk: PhishingRisk | string | null | undefined
  reasons?: string[]
}

export const PhishingWarning: React.FC<PhishingWarningProps> = ({ risk = 'none', reasons = [] }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const normRisk = (risk?.toLowerCase() || 'none') as PhishingRisk

  if (normRisk === 'none') {
    return null
  }

  if (normRisk === 'low') {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
        <span className="font-medium">
          Low security caution: Some unusual headers or links were detected in this message.
        </span>
      </div>
    )
  }

  if (normRisk === 'medium') {
    return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/40 p-4 text-amber-900 dark:text-amber-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Suspicious Email Warning (Medium Risk)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                This email exhibits patterns commonly associated with suspicious or unsolicited requests.
              </p>
            </div>
          </div>
          {reasons.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
            >
              {isExpanded ? 'Hide details' : 'View details'}
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {isExpanded && reasons.length > 0 && (
          <ul className="mt-3 pt-3 border-t border-amber-500/20 list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-300">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // High risk
  return (
    <div className="rounded-xl bg-red-500/15 border-2 border-red-500/50 p-4 text-red-900 dark:text-red-200 shadow-sm shadow-red-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                High Risk Phishing Alert
              </span>
            </div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Potential Phishing or Spoofing Attempt Detected
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300">
              Do not click any links, open attachments, or reply with personal credentials, passwords, or payment information.
            </p>
          </div>
        </div>
        {reasons.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-red-700 dark:text-red-300 hover:underline flex items-center gap-1 shrink-0"
          >
            {isExpanded ? 'Hide reasons' : 'Show reasons'}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {isExpanded && reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-red-500/20">
          <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
            Identified Threat Signals:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-red-700 dark:text-red-300">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
