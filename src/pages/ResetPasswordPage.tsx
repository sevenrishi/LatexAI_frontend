import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from 'lucide-react'

export function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Password strength calculation
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.')
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

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setErrorMessage(error.message || 'Failed to update password.')
        return
      }

      toast.success('Your password has been updated successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to update password. Session may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/60 shadow-xl backdrop-blur-xs">
      <CardHeader className="space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
          <Lock className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Set new password</CardTitle>
        <CardDescription>
          Enter and confirm your new secure password below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <FormField label="New Password" id="newPassword" required>
            <div className="relative">
              <Input
                id="newPassword"
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
              </div>
            )}
          </FormField>

          <FormField label="Confirm New Password" id="confirmPassword" required>
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

          <Button className="w-full gap-2" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password &amp; Continue
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <Link to="/login" className="hover:underline">
          Cancel and return to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}

export default ResetPasswordPage
