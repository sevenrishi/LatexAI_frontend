import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export interface OnboardingGuardProps {
  requireCompleted?: boolean
}

export function OnboardingGuard({ requireCompleted = true }: OnboardingGuardProps) {
  const { session, user, onboardingCompleted, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Not logged in is handled by ProtectedRoute
  if (!session || !user) {
    return <Navigate to="/login" replace />
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
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || '')}`} replace />
  }

  const isActuallyOnboarded = Boolean(
    onboardingCompleted ||
    user.user_metadata?.onboarding_completed ||
    (user.id && localStorage.getItem(`latexai_onboarded_${user.id}`) === 'true')
  )

  // If requireCompleted is true (for main app routes like /dashboard), but user has NOT completed onboarding
  if (requireCompleted && !isActuallyOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  // If requireCompleted is false (used on /onboarding route itself), but user HAS already completed onboarding
  if (!requireCompleted && isActuallyOnboarded) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
