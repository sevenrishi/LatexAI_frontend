import { api } from '@/lib/api'
import type { HistoryFilterParams, HistoryListResponse, ResumeHistoryItem } from '../types'
import type { GenerateResponse } from '@/types/generation'

export const historyApi = {
  getResumes: (params: HistoryFilterParams = {}) =>
    api.get<HistoryListResponse>('/resumes', {
      params: {
        search: params.search || undefined,
        status: params.status && params.status !== 'ALL' ? params.status : undefined,
        minScore: params.minScore !== undefined ? params.minScore : undefined,
        cursor: params.cursor || undefined,
        limit: params.limit || 6,
      },
    }),

  getResume: (id: string) =>
    api.get<ResumeHistoryItem>(`/resumes/${id}`),

  deleteResume: (id: string) =>
    api.delete<{ id: string; deleted: boolean }>(`/resumes/${id}`),

  reuseResume: (id: string) =>
    api.post<{ id: string; sourceId: string; status: string }>(`/resumes/${id}/reuse`),

  retryResume: (id: string) =>
    api.post<GenerateResponse>(`/generate/${id}/retry`),
}
