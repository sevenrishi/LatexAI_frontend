import { useEffect } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'

export function useQueryErrorToast(error: unknown) {
  useEffect(() => {
    if (!error) return

    if (error instanceof ApiError) {
      if (error.status !== 401 && error.status !== 404) {
        toast.error(error.friendlyMessage || error.message)
      }
    } else if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('An unexpected error occurred')
    }
  }, [error])
}
