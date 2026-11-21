import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

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

function extractNumericAtsScore(gen: Record<string, unknown>): number | null {
  if (typeof gen.ats_score === 'number') {
    return gen.ats_score
  }
  if (gen.ats_score && typeof gen.ats_score === 'object') {
    const atsObj = gen.ats_score as Record<string, unknown>
    if (typeof atsObj.overallScore === 'number') return atsObj.overallScore
    if (typeof atsObj.score === 'number') return atsObj.score
  }
  const meta = gen.metadata as Record<string, unknown> | undefined
  if (meta && typeof meta.ats_score === 'number') {
    return meta.ats_score
  }
  return null
}

function buildDashboardSummaryFromGenerations(generations: Array<Record<string, unknown>>): DashboardSummary {
  const totalResumes = generations.length
  const completedResumes = generations.filter((g) => g.status === 'completed').length
  const failedResumes = generations.filter((g) => g.status === 'failed').length
  const inProgressResumes = generations.filter((g) =>
    typeof g.status === 'string' &&
    ['queued', 'extracting', 'tailoring', 'rendering', 'compiling'].includes(g.status)
  ).length

  const scoredGens: number[] = []
  for (const g of generations) {
    const score = extractNumericAtsScore(g)
    if (typeof score === 'number') {
      scoredGens.push(score)
    }
  }
  let averageAtsScore: number | null = null
  if (scoredGens.length > 0) {
    const sum = scoredGens.reduce((acc, s) => acc + s, 0)
    averageAtsScore = Math.round((sum / scoredGens.length) * 10) / 10
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const dailyUsed = generations.filter((g) => typeof g.created_at === 'string' && g.created_at >= oneDayAgo).length
  const dailyLimit = 10
  const dailyRemaining = Math.max(0, dailyLimit - dailyUsed)

  const keywordCounts = new Map<string, number>()
  for (const g of generations) {
    const kw = g.extracted_keywords as Record<string, unknown> | undefined
    const list = [
      ...(Array.isArray(kw?.requiredSkills) ? (kw!.requiredSkills as string[]) : []),
      ...(Array.isArray(kw?.domainKeywords) ? (kw!.domainKeywords as string[]) : []),
    ]
    for (const item of list) {
      if (typeof item === 'string' && item.trim().length > 0) {
        const norm = item.trim()
        keywordCounts.set(norm, (keywordCounts.get(norm) || 0) + 1)
      }
    }
  }
  const topKeywords = Array.from(keywordCounts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const recentResumes: DashboardRecentResume[] = generations.slice(0, 5).map((g) => ({
    id: String(g.id || ''),
    jobTitle: String(g.job_title || 'Tailored Resume'),
    company: String(g.company_name || 'Target Company'),
    status: String(g.status || 'completed'),
    atsScore: extractNumericAtsScore(g),
    createdAt: String(g.created_at || new Date().toISOString()),
    templateId: typeof g.template_id === 'string' ? g.template_id : undefined,
  }))

  return {
    overview: {
      totalResumes,
      completedResumes,
      failedResumes,
      inProgressResumes,
      averageAtsScore,
    },
    quotas: {
      dailyUsed,
      dailyLimit,
      dailyRemaining,
    },
    recentResumes,
    topKeywords,
    totalGenerations: totalResumes,
    averageAtsScore,
  }
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    // 1. Try backend API first
    try {
      const summary = await api.get<DashboardSummary>('/dashboard/summary')
      if (summary) return summary
    } catch (apiErr) {
      console.warn('Backend /dashboard/summary request failed; falling back to direct Supabase data:', apiErr)
    }

    // 2. Direct Supabase query fallback for authenticated users (eliminates Render cold start delays)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: rows, error } = await supabase
          .from('generations')
          .select('id, job_title, company_name, status, ats_score, created_at, template_id, extracted_keywords, metadata')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (!error && rows) {
          return buildDashboardSummaryFromGenerations(rows as Array<Record<string, unknown>>)
        }
      }
    } catch (sbErr) {
      console.warn('Direct Supabase dashboard query fallback failed:', sbErr)
    }

    // 3. Graceful zeroed defaults
    return {
      overview: {
        totalResumes: 0,
        completedResumes: 0,
        failedResumes: 0,
        inProgressResumes: 0,
        averageAtsScore: null,
      },
      quotas: {
        dailyUsed: 0,
        dailyLimit: 10,
        dailyRemaining: 10,
      },
      recentResumes: [],
      topKeywords: [],
      totalGenerations: 0,
      averageAtsScore: null,
    }
  },
}
