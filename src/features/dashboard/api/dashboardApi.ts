import { api } from '@/lib/api'

export interface DashboardOverview {
  totalResumes: number
  completedResumes: number
  failedResumes: number
  inProgressResumes: number
  averageAtsScore: number | null
}

export interface DashboardQuotas {
  dailyUsed: number
  dailyLimit: number
  dailyRemaining: number
}

export interface DashboardRecentResume {
  id: string
  jobTitle?: string
  company?: string
  status: string
  atsScore?: number | null
  createdAt: string
  templateId?: string
}

export interface DashboardSummary {
  overview?: DashboardOverview
  quotas?: DashboardQuotas
  topKeywords?: Array<{ keyword: string; count: number }>
  templateUsage?: Array<{ templateId: string; count: number }>
  recentResumes: DashboardRecentResume[]
  totalGenerations?: number
  averageAtsScore?: number | null
}

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
}
