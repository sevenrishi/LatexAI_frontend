import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
  const location = useLocation()
  const { session, user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirectTo=${redirectUrl}`} replace />
  }

  // Email verification check
  const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
  const isEmailVerified = Boolean(
    isDemo ||
    user.email_confirmed_at ||
    user.confirmed_at ||
    user.app_metadata?.provider !== 'email' ||
    user.user_metadata?.email_verified === true
  )

  if (!isEmailVerified) {
    const emailParam = encodeURIComponent(user.email || '')
    return <Navigate to={`/verify-email?email=${emailParam}`} replace />
  }

  return <Outlet />
}
