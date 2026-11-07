import client from './client'
import type { Opportunity, OpportunityStatus } from '@/types'

export interface ListOpportunitiesParams {
  type?: string
  status?: OpportunityStatus
  search?: string
}

export const opportunitiesApi = {
  listOpportunities: (params?: ListOpportunitiesParams) =>
    client.get<Opportunity[]>('/api/v1/opportunities', { params }),

  getOpportunity: (id: string) =>
    client.get<Opportunity>(`/api/v1/opportunities/${id}`),

  updateStatus: (id: string, status: OpportunityStatus) =>
    client.patch<Opportunity>(`/api/v1/opportunities/${id}/status`, { status }),

  updateNotes: (id: string, notes: string) =>
    client.patch<Opportunity>(`/api/v1/opportunities/${id}/notes`, { notes }),

  deleteOpportunity: (id: string) =>
    client.delete<{ message: string }>(`/api/v1/opportunities/${id}`),
}
