import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/api/auth'

/**
 * Auth state. The session lives in an httpOnly cookie set by the backend, so no
 * token is ever stored in (or readable from) JavaScript. `checkAuth` asks the
 * server who we are; that is the single source of truth.
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  logout: () => {
    authApi.logout().catch(() => {})
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true })
      const res = await authApi.getMe()
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
