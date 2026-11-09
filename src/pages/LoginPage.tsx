import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const { setSession, setProfile } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.')
      return
    }

    setIsLoading(true)
    try {
      let session = null
      let user = null

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!error && data?.session && data?.user) {
          session = data.session
          user = data.user
        } else if (error && error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('Email not verified yet. Please check your inbox.')
          navigate(`/verify-email?email=${encodeURIComponent(email)}`)
          return
        }
      } catch {
        // Fallback to backend API
      }

      // If Supabase didn't authenticate, authenticate against backend /auth/login
      if (!session || !user) {
        try {
          const backendAuth = await authApi.login(email, password)
          if (backendAuth?.session && backendAuth?.user) {
            session = backendAuth.session
            user = backendAuth.user
          }
        } catch (apiErr) {
          setErrorMessage((apiErr as Error).message || 'Invalid email or password.')
          return
        }
      }

      if (session && user) {
        localStorage.removeItem('latexai_demo_token')
        localStorage.removeItem('latexai_demo_user')
        localStorage.removeItem('latexai_demo_profile')
        localStorage.removeItem('latexai_demo_profile_full')
        setSession(session, user)

        // Check email verification status
        const isVerified = Boolean(
          user.email_confirmed_at ||
          user.confirmed_at ||
          user.app_metadata?.provider !== 'email' ||
          user.user_metadata?.email_verified
        )

        if (!isVerified) {
          navigate(`/verify-email?email=${encodeURIComponent(user.email || email)}`)
          return
        }

        try {
          const profile = await authApi.getMe()
          setProfile(profile)
          toast.success('Signed in successfully!')
          if (!profile.onboardingCompleted) {
            navigate('/onboarding', { replace: true })
          } else {
            navigate(redirectTo, { replace: true })
          }
        } catch {
          toast.success('Signed in successfully!')
          navigate(redirectTo, { replace: true })
        }
      } else {
        setErrorMessage('Invalid email or password.')
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${env.VITE_APP_URL}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err) {
      toast.error((err as Error).message || `Failed to sign in with ${provider}`)
    }
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      const { session, user, profile } = authApi.loginDemoUser()
      setSession(session, user)
      setProfile(profile)
      toast.success('Signed in as Demo Engineer (Alex Rivera)!')
      navigate(redirectTo, { replace: true })
    } catch {
      toast.error('Failed to initiate demo login.')
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <Card className="border-border/60 shadow-xl backdrop-blur-xs">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to manage tailored LaTeX resumes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dev Demo Login Button */}
        {Boolean(env.VITE_ENABLE_DEMO_LOGIN) && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Development Mode Enabled</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full border-primary/40 bg-card hover:bg-primary/10 text-xs font-semibold text-primary gap-1.5"
            >
              {isDemoLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              One-Click Demo Login (Alex Rivera)
            </Button>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full text-xs font-medium gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="w-full text-xs font-medium gap-2"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            GitHub
          </Button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <FormField label="Email address" id="email" required>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </FormField>

          <FormField label="Password" id="password" required>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <Button className="w-full gap-2" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground">
        <div>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up free
          </Link>
        </div>
        <Link to="/forgot-password" className="hover:underline text-muted-foreground">
          Forgot your password?
        </Link>
      </CardFooter>
    </Card>
  )
}

export default LoginPage
