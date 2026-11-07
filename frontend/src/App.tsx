import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/hooks/useTheme'
import { DashboardPage } from '@/pages/DashboardPage'
import { InboxPage } from '@/pages/InboxPage'
import { ImportantPage } from '@/pages/ImportantPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { TasksPage } from '@/pages/TasksPage'
import { OpportunitiesPage } from '@/pages/OpportunitiesPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginPage } from '@/pages/LoginPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore()
  const hasToken = isAuthenticated || !!token || !!localStorage.getItem('access_token')

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore()
  const location = useLocation()
  useTheme() // Initialize theme state (dark/light)

  useEffect(() => {
    // Check if token returned via OAuth query param
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('access_token', token)
      useAuthStore.getState().setToken(token)
    }

    checkAuth()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="important" element={<ImportantPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
