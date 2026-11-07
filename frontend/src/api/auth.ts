import client from './client'
import type { User } from '@/types'

export const authApi = {
  getAuthorizeUrl: () => 
    client.get<{ authorization_url: string; state: string }>('/api/v1/auth/google'),

  handleCallback: (code: string, state: string) =>
    client.get<{ access_token: string; user: User }>(`/api/v1/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`),

  devLogin: () =>
    client.post<{ access_token: string; token_type: string; user: User }>('/api/v1/auth/dev-login'),

  getMe: () => 
    client.get<User>('/api/v1/auth/me'),

  logout: () => 
    client.post<{ status: string; message: string }>('/api/v1/auth/logout'),

  deleteAccount: () => 
    client.delete<{ message: string }>('/api/v1/auth/account'),
}
