import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { historyApi } from '../api/historyApi'
import type { HistoryFilterParams } from '../types'
import { toast } from 'sonner'

export function useInfiniteHistoryResumes(params: Omit<HistoryFilterParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: ['resumesHistory', params],
    queryFn: ({ pageParam }) =>
      historyApi.getResumes({
        ...params,
        cursor: pageParam ?? undefined,
        limit: params.limit || 5,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 30 * 1000,
  })
}

export function useHistoryResumes(params: HistoryFilterParams) {
  return useQuery({
    queryKey: ['resumesHistory', params],
    queryFn: () => historyApi.getResumes(params),
    staleTime: 30 * 1000,
  })
}

export function useDeleteResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => historyApi.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumesHistory'] })
      toast.success('Resume deleted successfully.')
    },
    onError: () => {
      toast.error('Failed to delete resume.')
    },
  })
}

export function useRetryResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => historyApi.retryResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumesHistory'] })
      toast.success('Resume generation restarted.')
    },
    onError: () => {
      toast.error('Failed to restart generation.')
    },
  })
}
