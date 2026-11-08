import client from './client'

export interface SyncStatus {
  is_syncing: boolean
  last_synced_at: string | null
  total_synced: number
}

export const gmailApi = {
  connectGmail: () =>
    client.get<{ auth_url: string }>('/api/v1/gmail/connect'),

  disconnectGmail: () =>
    client.post<{ message: string }>('/api/v1/gmail/disconnect'),

  syncEmails: (options?: { max_emails?: number; history_days?: number }) =>
    client.post<{ message: string; synced_count: number; mode?: 'demo' | 'gmail' }>('/api/v1/gmail/sync', options || {}),

  getSyncStatus: () =>
    client.get<SyncStatus>('/api/v1/gmail/sync/status'),
}
