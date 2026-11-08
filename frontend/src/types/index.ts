export interface User {
  id: string
  email: string
  name: string | null
  picture_url: string | null
  gmail_connected: boolean
  created_at: string
}

export interface Email {
  id: string
  gmail_message_id: string
  subject: string | null
  sender_email: string | null
  sender_name: string | null
  snippet: string | null
  received_at: string | null
  is_read: boolean
  is_important: boolean
  is_spam: boolean
  category: string | null
  priority: 'critical' | 'high' | 'medium' | 'low'
  phishing_risk: 'none' | 'low' | 'medium' | 'high'
  classification_confidence: number | null
}

export interface EmailDetail extends Email {
  body_text: string | null
  body_html: string | null
  recipients: string[]
  ai_summary: string | null
  ai_summary_structured: AISummary | null
  phishing_reasons: string[]
  tasks: Task[]
  opportunities: Opportunity[]
}

export interface AISummary {
  main_summary: string
  key_points: string[]
  required_action: string | null
  dates_deadlines: string[]
  relevant_links: string[]
  provider_used: string
}

export interface Task {
  id: string
  email_id: string | null
  title: string
  description: string | null
  due_date: string | null
  event_date: string | null
  organization: string | null
  priority: string
  confidence: number | null
  is_completed: boolean
  is_date_uncertain: boolean
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  email_id: string | null
  title: string
  company: string | null
  role: string | null
  opportunity_type: 'internship' | 'job' | 'hackathon' | 'scholarship' | 'workshop' | 'certification'
  eligibility: string | null
  skills_required: string[]
  location: string | null
  work_mode: string | null
  stipend: string | null
  application_url: string | null
  deadline: string | null
  status: 'new' | 'saved' | 'applied' | 'assessment' | 'interview' | 'rejected' | 'offer'
  notes: string | null
  confidence: number | null
  created_at: string
}

export interface AnalyticsSummary {
  total_emails: number
  unread_emails: number
  important_emails: number
  suspicious_emails: number
  total_tasks: number
  pending_tasks: number
  total_opportunities: number
  new_opportunities: number
  upcoming_deadlines_7d: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  has_next: boolean
}

export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type PhishingRisk = 'none' | 'low' | 'medium' | 'high'
export type OpportunityStatus = 'new' | 'saved' | 'applied' | 'assessment' | 'interview' | 'rejected' | 'offer'

export const CATEGORIES = [
  'Academic',
  'Administration',
  'Campus Service',
  'Career and Opportunity',
  'Financial Services',
  'Service Notification',
  'Scholarship',
  'Skill Development',
  'Miscellaneous'
] as const

export type Category = (typeof CATEGORIES)[number]

export interface EmailFilter {
  search?: string
  category?: string
  priority?: Priority
  is_read?: boolean
  is_important?: boolean
  is_spam?: boolean
  sort?: 'newest' | 'oldest'
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasNext: boolean
}
