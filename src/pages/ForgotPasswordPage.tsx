import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${env.VITE_APP_URL}/auth/callback?type=recovery`,
      })

      if (error) {
        setErrorMessage(error.message || 'Failed to send reset link.')
        return
      }

      setIsSubmitted(true)
      toast.success('Password reset instructions sent!')
    } catch (err) {
      setErrorMessage((err as Error).message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-border/60 shadow-xl backdrop-blur-xs text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            We sent password reset instructions to <br />
            <span className="font-semibold text-foreground break-all">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Click the recovery link in the email to set a new password. If you don&apos;t see it, check your spam folder.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="w-full text-xs font-medium"
          >
            Try another email address
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground">
          <Link to="/login" className="flex items-center gap-1.5 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-xl backdrop-blur-xs">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
        <CardDescription>
          Enter your account email and we will send you a password recovery link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button className="w-full gap-2" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send Recovery Link
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <Link to="/login" className="flex items-center gap-1.5 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  )
}

export default ForgotPasswordPage
