import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'
import { Mail, RefreshCw, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, user, setSession, setProfile } = useAuthStore()

  const emailParam = searchParams.get('email') || user?.email || session?.user?.email || 'your email'

  const [cooldown, setCooldown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Advance to onboarding or dashboard once email is confirmed
  const handleVerified = useCallback(
    async (confirmedUser: typeof user) => {
      toast.success('Email confirmed successfully! Welcome to LatexAI.')
      if (session && confirmedUser) {
        setSession(session, confirmedUser)
      }
      try {
        const profile = await authApi.getMe()
        setProfile(profile)
        if (!profile.onboardingCompleted) {
          navigate('/onboarding', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch {
        navigate('/onboarding', { replace: true })
      }
    },
    [session, setSession, setProfile, navigate]
  )

  // Check if current user is confirmed
  const checkVerificationStatus = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser?.email_confirmed_at || currentUser?.confirmed_at) {
        await handleVerified(currentUser)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [handleVerified])

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Cross-tab auto-advance check: onAuthStateChange + visibilitychange + polling
  useEffect(() => {
    // 1. Supabase onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user?.email_confirmed_at || newSession?.user?.confirmed_at) {
        await handleVerified(newSession.user)
      }
    })

    // 2. Tab focus / visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVerificationStatus()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 3. Periodic polling every 5s while awaiting verification
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkVerificationStatus()
      }
    }, 5000)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(pollInterval)
    }
  }, [checkVerificationStatus, handleVerified])

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailParam,
        options: {
          emailRedirectTo: `${env.VITE_APP_URL}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message || 'Failed to resend confirmation email.')
      } else {
        toast.success(`Verification email resent to ${emailParam}`)
        setCooldown(60)
      }
    } catch (err) {
      toast.error((err as Error).message || 'Failed to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  const handleManualCheck = async () => {
    setIsChecking(true)
    const isVerified = await checkVerificationStatus()
    setIsChecking(false)
    if (!isVerified) {
      toast.info('Email is not verified yet. Please check your inbox or click the link again.')
    }
  }

  // Quick dev bypass for demonstration if demo login or mocks active
  const handleDevBypass = () => {
    toast.success('Development bypass: Email verified!')
    navigate('/onboarding', { replace: true })
  }

  return (
    <Card className="border-border/60 shadow-xl backdrop-blur-xs text-center">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
          <Mail className="h-7 w-7 animate-bounce" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Verify your email</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          We sent a verification link to <br />
          <span className="font-semibold text-foreground break-all">{emailParam}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 text-left text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Next steps:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
            <li>Click the link inside the confirmation email.</li>
            <li>This tab will advance automatically once verified.</li>
            <li>Didn&apos;t receive it? Check your Spam or Promotions folder.</li>
          </ul>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full gap-2 text-sm font-semibold"
          >
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            I&apos;ve verified my email
          </Button>

          <Button
            variant="outline"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="w-full text-xs font-medium gap-2"
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend verification email'}
          </Button>
        </div>

        {/* Dev helper when demo mode is enabled */}
        {Boolean(env.VITE_ENABLE_DEMO_LOGIN) && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDevBypass}
              className="text-[11px] text-muted-foreground hover:text-primary gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Dev: Skip Verification &amp; Enter Onboarding
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-muted-foreground pt-0">
        <Link to="/register" className="hover:underline text-muted-foreground">
          Wrong email address? Use another
        </Link>
      </CardFooter>
    </Card>
  )
}

export default VerifyEmailPage
