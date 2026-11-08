import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Star,
  Tag,
  CheckSquare,
  Briefcase,
  BarChart2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Mail,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { formatSenderInitials, getAvatarColor } from '@/utils/format'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  unreadCount?: number
  pendingTasksCount?: number
  newOpportunitiesCount?: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  unreadCount = 0,
  pendingTasksCount = 0,
  newOpportunitiesCount = 0,
}) => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Inbox', to: '/inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: 'Important', to: '/important', icon: Star },
    { label: 'Categories', to: '/categories', icon: Tag },
    {
      label: 'Tasks & Deadlines',
      to: '/tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      label: 'Opportunities',
      to: '/opportunities',
      icon: Briefcase,
      badge: newOpportunitiesCount > 0 ? newOpportunitiesCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    { label: 'Analytics', to: '/analytics', icon: BarChart2 },
    { label: 'Settings', to: '/settings', icon: Settings },
  ]

  const userInitials = formatSenderInitials(user?.name, user?.email)
  const avatarBg = getAvatarColor(userInitials)

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>MailMind</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">
                Intelligent Inbox
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer: User profile & controls */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* User profile info & logout */}
          <div className="flex items-center justify-between gap-3 px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={user.name || 'User avatar'}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarBg}`}
                >
                  {userInitials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'user@mailmind.ai'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
