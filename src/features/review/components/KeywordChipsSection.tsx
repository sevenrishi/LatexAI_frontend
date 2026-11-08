import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Plus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useSkillsMutations } from '@/features/profile/hooks/useProfile'
import { toast } from 'sonner'

export interface KeywordChipsSectionProps {
  keywordsMatched?: string[]
  keywordsMissing?: string[]
  className?: string
  onSkillAdded?: (skillName: string) => void
}

export function KeywordChipsSection({
  keywordsMatched = [],
  keywordsMissing = [],
  className = '',
  onSkillAdded,
}: KeywordChipsSectionProps) {
  const { bulkAddSkills } = useSkillsMutations()
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set())
  const [addingSkill, setAddingSkill] = useState<string | null>(null)

  const handleAddSkillToProfile = async (keyword: string) => {
    if (addedSkills.has(keyword) || addingSkill === keyword) return

    setAddingSkill(keyword)
    try {
      await bulkAddSkills.mutateAsync({
        category: 'Technical Skills',
        names: [keyword],
      })
      setAddedSkills((prev) => new Set([...prev, keyword]))
      toast.success(`Added "${keyword}" to your profile skills!`)
      if (onSkillAdded) {
        onSkillAdded(keyword)
      }
    } catch {
      toast.error(`Failed to add "${keyword}" to profile`)
    } finally {
      setAddingSkill(null)
    }
  }

  return (
    <Card className={`border-border/70 shadow-xs ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Keyword &amp; Skill Matches</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              {keywordsMatched.length} Matched
            </Badge>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
              {keywordsMissing.length} Missing
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          Keywords extracted from the job description and compared against your resume content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-1">
        {/* Matched Keywords */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Matched Keywords ({keywordsMatched.length})</span>
          </div>
          {keywordsMatched.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No keywords matched yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5" data-testid="matched-keywords-list">
              {keywordsMatched.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="success"
                  className="px-2.5 py-1 text-xs gap-1.5 font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{keyword}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Missing Keywords with Profile-Add Shortcuts */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Missing Keywords ({keywordsMissing.length})</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Click <span className="font-semibold text-primary">+ Add</span> to save to profile
            </span>
          </div>

          {keywordsMissing.length === 0 ? (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Outstanding! All key JD technical keywords are represented in your resume.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2" data-testid="missing-keywords-list">
              {keywordsMissing.map((keyword) => {
                const isAdded = addedSkills.has(keyword)
                const isAdding = addingSkill === keyword

                return (
                  <div
                    key={keyword}
                    className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-md text-xs border transition-all ${
                      isAdded
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <span className="font-medium">{keyword}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSkillToProfile(keyword)}
                      disabled={isAdded || isAdding}
                      className={`h-6 px-1.5 text-[11px] rounded gap-1 transition-all ${
                        isAdded
                          ? 'text-emerald-600 dark:text-emerald-400 cursor-default hover:bg-transparent'
                          : 'text-primary hover:bg-primary/10 hover:text-primary'
                      }`}
                      data-testid={`add-skill-${keyword}`}
                      aria-label={isAdded ? `Added ${keyword}` : `Add ${keyword} to profile`}
                    >
                      {isAdding ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAdded ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>In Profile</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          <span>Add to Profile</span>
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default KeywordChipsSection
