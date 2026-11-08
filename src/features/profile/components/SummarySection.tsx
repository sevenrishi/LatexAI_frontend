import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CharCounter } from '@/components/common/CharCounter'
import { Lightbulb, Save, Check, Sparkles } from 'lucide-react'
import type { FullProfile } from '@/types/profile'
import { useUpdateProfile } from '../hooks/useProfile'

interface SummarySectionProps {
  profile: FullProfile
  onDirtyChange?: (isDirty: boolean) => void
}

const MAX_SUMMARY_CHARS = 1000
const RECOMMENDED_MIN = 120
const RECOMMENDED_MAX = 500

export function SummarySection({ profile, onDirtyChange }: SummarySectionProps) {
  const updateProfile = useUpdateProfile()
  const [summary, setSummary] = useState(profile.summary || '')
  const [isSaved, setIsSaved] = useState(false)

  const isDirty = summary !== (profile.summary || '')

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    setSummary(profile.summary || '')
  }, [profile.summary])

  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile.mutateAsync({
      summary: summary.trim(),
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>
            A high-impact executive summary placed right below your contact details. This sets the narrative tone for ATS scoring and recruiter screening.
          </CardDescription>
        </div>
        {isDirty && (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            Unsaved changes
          </span>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Results-driven Senior Software Engineer with 7+ years of experience architecting high-throughput distributed systems and cloud-native microservices..."
              rows={5}
              maxLength={MAX_SUMMARY_CHARS}
              className="resize-y min-h-[120px] font-sans text-sm leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs text-muted-foreground">
                {wordCount} words &bull; Recommended: {RECOMMENDED_MIN}–{RECOMMENDED_MAX} characters
              </span>
              <CharCounter current={summary.length} max={MAX_SUMMARY_CHARS} />
            </div>
          </div>

          {/* Writing Tips Banner */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Pro Formula for ATS Impact
            </div>
            <p>
              [Current Title] + [Years of Experience] + [Core Technical Domain] + [Quantified Career Milestone].
              Avoid first-person pronouns (&ldquo;I&rdquo;, &ldquo;my&rdquo;) for formal LaTeX templates.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Used as base context during job-specific resume tailoring
            </div>
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
                  {updateProfile.isPending ? 'Saving...' : 'Save Summary'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
