import client from './client'
import type { Email, EmailDetail, AISummary, PaginatedResponse, Priority } from '@/types'

export interface ListEmailsParams {
  page?: number
  page_size?: number
  search?: string
  category?: string
  priority?: Priority
  is_read?: boolean
  is_important?: boolean
  is_spam?: boolean
  sort?: 'newest' | 'oldest'
}

export const emailsApi = {
  listEmails: (params?: ListEmailsParams) =>
    client.get<PaginatedResponse<Email>>('/api/v1/emails', { params }),

  getEmail: (id: string) =>
    client.get<EmailDetail>(`/api/v1/emails/${id}`),

  markRead: (id: string, is_read = true) =>
    client.patch<Email>(`/api/v1/emails/${id}/read`, { is_read }),

  markImportant: (id: string, is_important = true) =>
    client.patch<Email>(`/api/v1/emails/${id}/important`, { is_important }),

  markSpam: (id: string) =>
    client.post<Email>(`/api/v1/emails/${id}/spam`),

  updateCategory: (id: string, category: string) =>
    client.patch<Email>(`/api/v1/emails/${id}/category`, { category }),

  updatePriority: (id: string, priority: Priority) =>
    client.patch<Email>(`/api/v1/emails/${id}/priority`, { priority }),

  summarizeEmail: (id: string) =>
    client.post<AISummary>(`/api/v1/emails/${id}/summarize`),

  getReplySuggestions: (id: string, style: string) =>
    client.post<{ draft: string; style: string }>(`/api/v1/emails/${id}/reply-suggestions`, { style }),
}
