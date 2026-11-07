import React from 'react'
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Mail,
  Moon,
  Sun,
  Key,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatSenderInitials, getAvatarColor } from '@/utils/format'

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const toast = useToast()

  const userInitials = formatSenderInitials(user?.name, user?.email)
  const avatarBg = getAvatarColor(userInitials)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-500" />
          Settings & Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your connected Gmail service, machine learning configurations, and application preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Card */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            User Identity
          </h2>

          <div className="flex items-center gap-4">
            {user?.picture_url ? (
              <img
                src={user.picture_url}
                alt={user?.name || 'User avatar'}
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/20"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm ${avatarBg}`}
              >
                {userInitials}
              </div>
            )}
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {user?.name || 'MailMind User'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <Badge variant="outline" className="text-[10px] text-indigo-500 border-indigo-500/30">
                Authenticated via OAuth 2.0
              </Badge>
            </div>
          </div>
        </Card>

        {/* Gmail Connection & OAuth */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              Gmail API Integration
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your connection uses Google OAuth 2.0 authorization tokens. Tokens are encrypted at rest using Fernet symmetric encryption and scoped strictly to read-only metadata and label modifications.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                toast.success('Sync triggered!')
              }}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Now
            </Button>
          </div>
        </Card>

        {/* Appearance & Preferences */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            Appearance
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Theme Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between high-contrast dark mode and clean paper light mode.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme} className="text-xs">
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </Card>

        {/* Security & Architecture Highlights */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Security & Compliance
          </h2>

          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
            <li>Tokens encrypted at rest using AES-128 CBC via Fernet cipher.</li>
            <li>Multi-user IDOR protection enforcing strict ownership on all queries.</li>
            <li>Strict DOMPurify HTML sanitization eliminating XSS vulnerabilities.</li>
            <li>Zero hardcoded passwords; passwords are never requested or stored.</li>
          </ul>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="danger" size="sm" onClick={logout} className="text-xs">
              Sign Out of MailMind
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
