import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('access_token'),
      isAuthenticated: !!localStorage.getItem('access_token'),
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('access_token', token)
        } else {
          localStorage.removeItem('access_token')
        }
        set({ token, isAuthenticated: !!token })
      },

      logout: () => {
        authApi.logout().catch(() => {})
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          return
        }

        try {
          set({ isLoading: true })
          const res = await authApi.getMe()
          set({ user: res.data, isAuthenticated: true, isLoading: false })
        } catch {
          // If token is invalid or server unavailable, preserve dev/mock session if present
          if (get().user) {
            set({ isLoading: false })
          } else {
            localStorage.removeItem('access_token')
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          }
        }
      },
    }),
    {
      name: 'mailmind-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
