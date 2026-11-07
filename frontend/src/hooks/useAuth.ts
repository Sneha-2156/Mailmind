import { useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, setUser, setToken, logout, checkAuth } = useAuthStore()

  const initiateGoogleLogin = useCallback(async () => {
    try {
      const res = await authApi.getAuthorizeUrl()
      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url
      }
    } catch (err) {
      console.error('Failed to get authorization URL:', err)
      throw err
    }
  }, [])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    logout,
    checkAuth,
    initiateGoogleLogin,
  }
}
