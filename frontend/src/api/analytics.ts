import client from './client'
import type { AnalyticsSummary } from '@/types'

export interface CategoryDistributionItem {
  category: string
  count: number
  percentage: number
}

export interface PriorityDistributionItem {
  priority: string
  count: number
  percentage: number
}

export interface WeeklyActivityItem {
  day: string
  date: string
  count: number
}

export interface OpportunityOverviewItem {
  status: string
  count: number
}

export const analyticsApi = {
  getSummary: () =>
    client.get<AnalyticsSummary>('/api/v1/analytics/summary'),

  getCategoryDistribution: () =>
    client.get<CategoryDistributionItem[]>('/api/v1/analytics/categories'),

  getPriorityDistribution: () =>
    client.get<PriorityDistributionItem[]>('/api/v1/analytics/priorities'),

  getWeeklyActivity: () =>
    client.get<WeeklyActivityItem[]>('/api/v1/analytics/weekly'),

  getOpportunitiesOverview: () =>
    client.get<OpportunityOverviewItem[]>('/api/v1/analytics/opportunities'),
}
