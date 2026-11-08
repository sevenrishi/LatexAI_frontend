import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export function PublicOnlyRoute() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { session, user, onboardingCompleted, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (session && user) {
    const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
    const isEmailVerified = Boolean(
      isDemo ||
      user.email_confirmed_at ||
      user.confirmed_at ||
      user.app_metadata?.provider !== 'email' ||
      user.user_metadata?.email_verified === true
    )

    // If email is not verified, allow them to stay on /verify-email, else redirect them to it
    if (!isEmailVerified) {
      if (location.pathname.startsWith('/verify-email')) {
        return <Outlet />
      }
      return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || '')}`} replace />
    }

    // If on /verify-email but already verified, proceed forward
    if (location.pathname.startsWith('/verify-email')) {
      return <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace />
    }

    if (!onboardingCompleted) {
      return <Navigate to="/onboarding" replace />
    }

    const redirectTo = searchParams.get('redirectTo') || '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
