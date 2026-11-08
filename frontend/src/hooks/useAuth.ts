import { useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, logout, checkAuth } = useAuthStore()

  const initiateGoogleLogin = useCallback(async () => {
    try {
      const res = await authApi.getAuthorizeUrl()
      if (res.data?.authorization_url) {
        window.location.href = res.data.authorization_url
      }
    } catch (err) {
      console.error('Failed to get authorization URL:', err)
      throw err
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    logout,
    checkAuth,
    initiateGoogleLogin,
  }
}
