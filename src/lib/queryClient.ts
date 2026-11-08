import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from './api'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const apiErr = error instanceof ApiError ? error : null
      // Skip toast for 401 or 404 (handled by route guards / not found UI)
      if (apiErr && (apiErr.status === 401 || apiErr.status === 404)) {
        return
      }
      toast.error(apiErr?.friendlyMessage || error.message || 'Something went wrong')
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const apiErr = error instanceof ApiError ? error : null
      toast.error(apiErr?.friendlyMessage || error.message || 'Action failed')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403 || error.status === 404) {
            return false
          }
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
