import { useState } from 'react'
import { Lock, KeyRound, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'

export function SecurityPasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.updatePassword({
        currentPassword,
        newPassword,
      })
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = (err as Error).message || 'Failed to update password.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-xs" data-testid="security-password-section">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <span>Security &amp; Password</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Ensure your account is protected with a strong, unique password of at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {error && (
            <div
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
              data-testid="password-error-alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <FormField label="Current Password" id="currentPassword">
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs h-9"
              autoComplete="current-password"
              data-testid="input-current-password"
            />
          </FormField>

          <FormField
            label="New Password"
            id="newPassword"
            description="Minimum 8 characters with letters, numbers, and symbols"
          >
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs h-9"
              autoComplete="new-password"
              data-testid="input-new-password"
            />
          </FormField>

          <FormField label="Confirm New Password" id="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs h-9"
              autoComplete="new-password"
              data-testid="input-confirm-password"
            />
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !newPassword}
              className="text-xs gap-1.5 font-semibold"
              data-testid="update-password-btn"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <KeyRound className="h-3.5 w-3.5" />
              )}
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default SecurityPasswordSection
