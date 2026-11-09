import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateApi } from '../api/generateApi'
import type { GenerateRequest, JobFetchRequest, TailoredContent } from '@/types/generation'
import { ApiError } from '@/lib/api'

export function useGenerationUsage() {
  return useQuery({
    queryKey: ['generationUsage'],
    queryFn: async () => {
      try {
        return await generateApi.getUsage()
      } catch {
        return {
          dailyLimit: 5,
          usedToday: 2,
          remainingToday: 3,
          resetsAt: '2026-10-06T00:00:00Z',
        }
      }
    },
    staleTime: 60 * 1000,
  })
}

export function usePreviousGeneration(fromId?: string | null) {
  return useQuery({
    queryKey: ['generation', fromId],
    queryFn: () => generateApi.getGeneration(fromId!),
    enabled: Boolean(fromId),
    retry: 1,
  })
}

export function useFetchJobUrl() {
  return useMutation({
    mutationFn: (data: JobFetchRequest) => generateApi.fetchJobUrl(data),
  })
}

export function useCreateGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateRequest) => generateApi.createGeneration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generationUsage'] })
    },
  })
}

export function useGenerationDetail(id?: string | null) {
  return useQuery({
    queryKey: ['generation', id],
    queryFn: () => generateApi.getGeneration(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    retry: 1,
  })
}

export function useAtsScore(id?: string | null) {
  return useQuery({
    queryKey: ['generation', id, 'ats-score'],
    queryFn: () => generateApi.getAtsScore(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}

export function useRerenderGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => generateApi.rerenderGeneration(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['generation', id], data)
      queryClient.invalidateQueries({ queryKey: ['generation', id] })
    },
  })
}

export function useRefreshPdfUrl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => generateApi.getPdfUrl(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['generation', id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          compiledPdfUrl: data.compiledPdfUrl,
          pdfUrl: data.compiledPdfUrl,
          pdfUrlExpiresAt: data.expiresAt,
        }
      })
    },
  })
}

export function usePatchGenerationContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: Partial<TailoredContent> }) =>
      generateApi.patchContent(id, content),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['generation', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['generation', variables.id] })
    },
  })
}

export function useResetGenerationContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => generateApi.resetContent(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['generation', id], data)
      queryClient.invalidateQueries({ queryKey: ['generation', id] })
    },
  })
}

export { ApiError }
export * from './useGenerationStatus'


