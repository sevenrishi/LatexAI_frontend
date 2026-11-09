import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/common/FormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Globe, ExternalLink, Save, Check } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/common/Icons'
import type { FullProfile, ProfileLink } from '@/types/profile'
import { useUpdateProfile } from '../hooks/useProfile'

interface ContactInfoSectionProps {
  profile: FullProfile
  onDirtyChange?: (isDirty: boolean) => void
}

export function ContactInfoSection({ profile, onDirtyChange }: ContactInfoSectionProps) {
  const updateProfile = useUpdateProfile()

  const [fullName, setFullName] = useState(profile.fullName || '')
  const [headline, setHeadline] = useState(profile.headline || '')
  const [email, setEmail] = useState(profile.email || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [location, setLocation] = useState(profile.location || '')
  const [website, setWebsite] = useState(profile.website || '')
  const [github, setGithub] = useState(profile.github || '')
  const [linkedin, setLinkedin] = useState(profile.linkedin || '')
  const [customLinks, setCustomLinks] = useState<ProfileLink[]>(profile.customLinks || [])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaved, setIsSaved] = useState(false)

  // Track dirty state
  const isDirty =
    fullName !== (profile.fullName || '') ||
    headline !== (profile.headline || '') ||
    email !== (profile.email || '') ||
    phone !== (profile.phone || '') ||
    location !== (profile.location || '') ||
    website !== (profile.website || '') ||
    github !== (profile.github || '') ||
    linkedin !== (profile.linkedin || '') ||
    JSON.stringify(customLinks) !== JSON.stringify(profile.customLinks || [])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // Reset form when profile prop updates externally
  useEffect(() => {
    setFullName(profile.fullName || '')
    setHeadline(profile.headline || '')
    setEmail(profile.email || '')
    setPhone(profile.phone || '')
    setLocation(profile.location || '')
    setWebsite(profile.website || '')
    setGithub(profile.github || '')
    setLinkedin(profile.linkedin || '')
    setCustomLinks(profile.customLinks || [])
  }, [profile])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'Full name is required'
    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      {
        id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        url: '',
      },
    ])
  }

  const handleRemoveLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((l) => l.id !== id))
  }

  const handleUpdateLink = (id: string, field: 'label' | 'url', value: string) => {
    setCustomLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await updateProfile.mutateAsync({
      fullName: fullName.trim(),
      headline: headline.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      website: website.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
      customLinks: customLinks.filter((l) => l.label.trim() && l.url.trim()),
    })

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Contact Information & Links</CardTitle>
          <CardDescription>
            These details appear in your resume header. They serve as primary contact points for recruiters.
          </CardDescription>
        </div>
        {isDirty && (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            Unsaved changes
          </span>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" id="fullName" required error={errors.fullName}>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </FormField>

            <FormField label="Professional Headline" id="headline">
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
              />
            </FormField>

            <FormField label="Email Address" id="email" required error={errors.email}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
              />
            </FormField>

            <FormField label="Phone Number" id="phone">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 000-0000"
              />
            </FormField>

            <FormField label="Location (City, State / Country)" id="location">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </FormField>

            <FormField
              label="Personal Website / Portfolio"
              id="website"
              description="Personal domain or online portfolio"
            >
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="pl-9"
                />
              </div>
            </FormField>

            <FormField label="GitHub Profile" id="github">
              <div className="relative">
                <GithubIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="pl-9"
                />
              </div>
            </FormField>

            <FormField label="LinkedIn Profile" id="linkedin">
              <div className="relative">
                <LinkedinIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="pl-9"
                />
              </div>
            </FormField>
          </div>

          {/* Dynamic Link Repeaters */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Additional Custom Links</h4>
                <p className="text-xs text-muted-foreground">
                  Add links to technical blogs, Google Scholar, Kaggle, Twitter/X, or patents.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Link
              </Button>
            </div>

            {customLinks.length === 0 ? (
              <p className="text-xs italic text-muted-foreground/75 py-2">
                No custom links added yet. Click &quot;Add Link&quot; to include extra portfolio links.
              </p>
            ) : (
              <div className="space-y-2.5">
                {customLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Label (e.g. Blog, Google Scholar)"
                      value={link.label}
                      onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                      className="w-1/3"
                    />
                    <div className="relative flex-1">
                      <ExternalLink className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLink(link.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Remove link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
              className="min-w-32 gap-2"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
