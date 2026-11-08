import { api } from '@/lib/api'
import type {
  GenerateRequest,
  GenerateResponse,
  JobFetchRequest,
  JobFetchResponse,
  GenerationUsage,
  GenerationDetail,
  GenerationStatusResponse,
  AtsScoreData,
  TailoredContent,
  ResumeDownloadResponse,
} from '@/types/generation'

export const generateApi = {
  createGeneration: (data: GenerateRequest) =>
    api.post<GenerateResponse>('/generate', data),

  fetchJobUrl: (data: JobFetchRequest) =>
    api.post<JobFetchResponse>('/jobs/fetch', data),

  getUsage: () =>
    api.get<GenerationUsage>('/generate/usage'),

  getGeneration: (id: string) =>
    api.get<GenerationDetail>(`/generate/${id}`),

  getStatus: (id: string) =>
    api.get<GenerationStatusResponse>(`/generate/${id}/status`),

  getAtsScore: (id: string) =>
    api.get<AtsScoreData>(`/generate/${id}/ats-score`),

  getPdfUrl: (id: string) =>
    api.get<{ compiledPdfUrl: string; expiresAt: string }>(`/generate/${id}/pdf-url`),

  patchContent: (id: string, content: Partial<TailoredContent>) =>
    api.patch<GenerationDetail>(`/generate/${id}/content`, content),

  resetContent: (id: string) =>
    api.post<GenerationDetail>(`/generate/${id}/content/reset`),

  rerenderGeneration: (id: string) =>
    api.post<GenerationDetail>(`/generate/${id}/rerender`),

  retryGeneration: (id: string) =>
    api.post<GenerateResponse>(`/generate/${id}/retry`),

  cancelGeneration: (id: string) =>
    api.post<{ success: boolean }>(`/generate/${id}/cancel`),

  getDownloadUrl: (id: string, format: 'pdf' | 'tex' = 'pdf') =>
    api.get<ResumeDownloadResponse>(`/resumes/${id}/download`, {
      params: { format },
    }),
}
