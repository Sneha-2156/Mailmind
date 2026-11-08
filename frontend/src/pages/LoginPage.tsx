import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Shield,
  Sparkles,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Lock,
} from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const res = await authApi.getAuthorizeUrl()
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url
      }
    } catch {
      toast.error('Google OAuth initialization failed. Try Demo Access below.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      const res = await authApi.devLogin()
      setUser(res.data.user)
      toast.success('Logged in as Demo Scholar!')
      navigate('/dashboard')
    } catch {
      toast.error('Could not authenticate demo user.')
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>MailMind</span>
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              AI
            </span>
          </h1>
          <p className="text-sm text-slate-400">Your inbox, intelligently understood.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
          <div className="space-y-3">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Or Explore Instantly</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Instant Demo Account Access */}
            <button
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDemoLoading ? 'Loading Workspace...' : 'Explore with Demo Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Value Props Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Calibrated ML classification into 9 academic & career domains</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Automated task, deadline & internship opportunity extraction</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Explainable phishing risk detection & secure HTML sanitization</span>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            OAuth 2.0 encrypted tokens. We never access or store passwords.
          </p>
        </div>
      </div>
    </div>
  )
}
