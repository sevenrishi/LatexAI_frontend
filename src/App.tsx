import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/app/router'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap'
import { useUIStore, applyTheme } from '@/store/uiStore'

export function App() {
  const theme = useUIStore((s) => s.theme)
  useAuthBootstrap()

  useEffect(() => {
    // Apply current theme preference on initial mount
    applyTheme(theme)
  }, [theme])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
