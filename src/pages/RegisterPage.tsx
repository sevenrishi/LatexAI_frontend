import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setSession, setProfile } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Password strength logic
  const strengthChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const strengthScore = useMemo(() => {
    let score = 0
    if (strengthChecks.length) score += 1
    if (strengthChecks.mixedCase) score += 1
    if (strengthChecks.hasNumber) score += 1
    if (strengthChecks.hasSpecial) score += 1
    return score
  }, [strengthChecks])

  const strengthColor = useMemo(() => {
    if (strengthScore <= 1) return 'bg-destructive'
    if (strengthScore === 2) return 'bg-amber-500'
    if (strengthScore === 3) return 'bg-blue-500'
    return 'bg-emerald-500'
  }, [strengthScore])

  const strengthLabel = useMemo(() => {
    if (!password) return ''
    if (strengthScore <= 1) return 'Weak'
    if (strengthScore === 2) return 'Fair'
    if (strengthScore === 3) return 'Good'
    return 'Strong'
  }, [strengthScore, password])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (strengthScore < 2) {
      setErrorMessage('Please choose a stronger password with at least 8 characters.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setIsLoading(true)
    try {
      let registeredSession = null
      let registeredUser = null

      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${env.VITE_APP_URL}/auth/callback`,
          },
        })

        if (!error && (data?.session || data?.user)) {
          registeredSession = data.session
          registeredUser = data.user
        }
      } catch {
        // Fallback to backend API signup
      }

      // If Supabase didn't register or is offline/dummy, register via backend API
      if (!registeredSession && !registeredUser) {
        try {
          const res = await authApi.signup(email.trim(), password, fullName.trim())
          if (res?.session && res?.user) {
            registeredSession = res.session
            registeredUser = res.user
          }
        } catch (apiErr) {
          setErrorMessage((apiErr as Error).message || 'Failed to create account.')
          return
        }
      }

      if (registeredSession && registeredUser) {
        localStorage.removeItem('latexai_demo_token')
        localStorage.removeItem('latexai_demo_user')
        localStorage.removeItem('latexai_demo_profile')
        localStorage.removeItem('latexai_demo_profile_full')
        setSession(registeredSession, registeredUser)
        setProfile({
          id: registeredUser.id,
          email: registeredUser.email || email.trim(),
          fullName: fullName.trim(),
          headline: '',
          onboardingCompleted: false,
          activeTemplateId: 'tpl_default_swe',
        })
        try {
          const remoteProfile = await authApi.getMe()
          if (remoteProfile) setProfile(remoteProfile)
        } catch {
          // background sync best-effort
        }
        toast.success('Account created!')
        navigate('/onboarding', { replace: true })
      } else if (registeredUser) {
        // Confirmation email sent
        toast.success('Registration successful! Please check your email to verify your account.')
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true })
      } else {
        setErrorMessage('Failed to create account. Please try again.')
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${env.VITE_APP_URL}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err) {
      toast.error((err as Error).message || `Failed to sign up with ${provider}`)
    }
  }

  return (
    <Card className="border-border/60 shadow-xl backdrop-blur-xs">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription>
          Start generating tailored LaTeX resumes in under 60 seconds.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
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

        <form onSubmit={handleRegister} className="space-y-4">
          <FormField label="Full Name" id="name" required>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
            />
          </FormField>

          <FormField label="Email address" id="email" required>
            <Input
              id="email"
              type="email"
              placeholder="alex@example.com"
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
                placeholder="At least 8 characters"
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

            {/* Strength Meter */}
            {password && (
              <div className="mt-2 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className="font-semibold text-foreground">{strengthLabel}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        level <= strengthScore ? strengthColor : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-muted-foreground">
                  <span className={`flex items-center gap-1 ${strengthChecks.length ? 'text-emerald-500' : ''}`}>
                    <Check className="h-3 w-3" /> 8+ characters
                  </span>
                  <span className={`flex items-center gap-1 ${strengthChecks.mixedCase ? 'text-emerald-500' : ''}`}>
                    <Check className="h-3 w-3" /> Upper & lowercase
                  </span>
                  <span className={`flex items-center gap-1 ${strengthChecks.hasNumber ? 'text-emerald-500' : ''}`}>
                    <Check className="h-3 w-3" /> Number
                  </span>
                  <span className={`flex items-center gap-1 ${strengthChecks.hasSpecial ? 'text-emerald-500' : ''}`}>
                    <Check className="h-3 w-3" /> Special character
                  </span>
                </div>
              </div>
            )}
          </FormField>

          <FormField label="Confirm Password" id="confirmPassword" required>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </FormField>

          {/* Terms Acceptance */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              required
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer select-none">
              I agree to the{' '}
              <a href="#" className="font-medium text-foreground underline hover:text-primary">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-foreground underline hover:text-primary">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <Button className="w-full gap-2" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Free Account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="ml-1 font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}

export default RegisterPage
