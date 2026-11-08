import { useState, useEffect } from 'react'
import { User, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'

export function AccountDetailsSection() {
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)

  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [headline, setHeadline] = useState(profile?.headline || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '')
      setHeadline(profile.headline || '')
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await authApi.updateProfile({
        fullName: fullName.trim(),
        headline: headline.trim(),
      })
      setProfile(updated)
      toast.success('Account profile updated successfully!')
    } catch {
      toast.error('Failed to update account profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const initials = (fullName || profile?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <Card className="border-border/70 shadow-xs" data-testid="account-details-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Account Details</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
            Free Plan • 5 Resumes/Day
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Manage your personal details, professional headline, and verified account email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Identity Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/70">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-lg border border-primary/30">
            {initials}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm truncate">
                {fullName || 'LaTeX AI Member'}
              </span>
              <Badge variant="success" className="text-[10px] gap-1 py-0">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="h-3.5 w-3.5" />
              <span>{profile?.email || 'demo@latexai.dev'}</span>
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <FormField label="Full Name" id="fullName">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="text-xs h-9"
              data-testid="input-full-name"
            />
          </FormField>

          <FormField
            label="Professional Headline"
            id="headline"
            description="Used as the default candidate title in LaTeX document headers"
          >
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full Stack & AI Systems Engineer"
              className="text-xs h-9"
              data-testid="input-headline"
            />
          </FormField>

          <FormField label="Account Email Address" id="email" description="Email addresses are managed through your auth provider">
            <Input
              id="email"
              value={profile?.email || 'demo@latexai.dev'}
              disabled
              className="text-xs h-9 bg-muted/50 cursor-not-allowed opacity-80"
              data-testid="input-email-disabled"
            />
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="text-xs gap-1.5 font-semibold"
              data-testid="save-account-btn"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetailsSection
