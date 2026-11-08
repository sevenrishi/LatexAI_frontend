import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSession, setProfile } = useAuthStore()

  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string } | null>(null)
  const [statusMessage, setStatusMessage] = useState('Verifying authentication token...')

  useEffect(() => {
    let isMounted = true

    async function handleAuthExchange() {
      try {
        // 1. Check for error parameters in query string or URL hash
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        const error = urlParams.get('error') || hashParams.get('error')
        const errorDescription =
          urlParams.get('error_description') ||
          hashParams.get('error_description') ||
          urlParams.get('error_code')

        if (error || errorDescription) {
          if (isMounted) {
            setErrorDetails({
              title: 'Authentication Failed',
              message: errorDescription || error || 'The authentication link has expired or is invalid.',
            })
          }
          return
        }

        // 2. Check for password recovery flow
        const type = urlParams.get('type') || hashParams.get('type')
        const isRecovery = type === 'recovery'

        // 3. Check for PKCE authorization code
        const code = urlParams.get('code')
        if (code) {
          if (isMounted) setStatusMessage('Exchanging authorization code...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            if (isMounted) {
              setErrorDetails({
                title: 'Session Exchange Failed',
                message: exchangeError.message,
              })
            }
            return
          }

          if (data.session && data.user) {
            setSession(data.session, data.user)

            if (isRecovery) {
              toast.info('Please set your new password.')
              navigate('/reset-password', { replace: true })
              return
            }

            // Sync user profile & onboarding status
            try {
              if (isMounted) setStatusMessage('Syncing user profile...')
              const profile = await authApi.getMe()
              setProfile(profile)
              const redirectTo = searchParams.get('redirectTo') || (profile.onboardingCompleted ? '/dashboard' : '/onboarding')
              navigate(redirectTo, { replace: true })
            } catch {
              navigate('/dashboard', { replace: true })
            }
            return
          }
        }

        // 4. Fallback check for session already established via hash/local storage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          if (isMounted) {
            setErrorDetails({
              title: 'Session Error',
              message: sessionError.message,
            })
          }
          return
        }

        if (session && session.user) {
          setSession(session, session.user)

          if (isRecovery) {
            navigate('/reset-password', { replace: true })
            return
          }

          try {
            const profile = await authApi.getMe()
            setProfile(profile)
            const redirectTo = searchParams.get('redirectTo') || (profile.onboardingCompleted ? '/dashboard' : '/onboarding')
            navigate(redirectTo, { replace: true })
          } catch {
            navigate('/dashboard', { replace: true })
          }
        } else {
          // If no session found
          if (isMounted) {
            setErrorDetails({
              title: 'No Session Found',
              message: 'Could not verify your authentication session. Please try logging in again.',
            })
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorDetails({
            title: 'Unexpected Error',
            message: (err as Error).message || 'An error occurred during authentication exchange.',
          })
        }
      }
    }

    handleAuthExchange()

    return () => {
      isMounted = false
    }
  }, [navigate, searchParams, setSession, setProfile])

  if (errorDetails) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/30 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">{errorDetails.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              {errorDetails.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild className="w-full gap-2">
              <Link to="/login">
                Return to Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="justify-center text-xs text-muted-foreground">
            <Link to="/forgot-password" className="hover:underline">
              Request a new password reset link
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/60 shadow-lg text-center p-6">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <h2 className="text-lg font-bold text-foreground">Completing sign in...</h2>
          <p className="text-xs text-muted-foreground animate-pulse">{statusMessage}</p>
        </div>
      </Card>
    </div>
  )
}

export default AuthCallbackPage
