import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BulkSkillsDialog } from './BulkSkillsDialog'
import { Plus, X, ClipboardList, Sparkles, Layers } from 'lucide-react'
import type { FullProfile, SkillItem } from '@/types/profile'
import { useSkillsMutations } from '../hooks/useProfile'

interface SkillsSectionProps {
  profile: FullProfile
}

const DEFAULT_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'DevOps',
  'Tools',
]

export function SkillsSection({ profile }: SkillsSectionProps) {
  const { saveSkills, bulkAddSkills } = useSkillsMutations()
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [targetCategoryForBulk, setTargetCategoryForBulk] = useState('Languages')
  const [newSkillInput, setNewSkillInput] = useState<Record<string, string>>({})

  const rawSkills = profile.skills || []
  const seenSkillNames = new Set<string>()
  const allSkills = rawSkills.filter((s) => {
    const key = (s.name || '').trim().toLowerCase()
    if (seenSkillNames.has(key)) return false
    seenSkillNames.add(key)
    return true
  })

  // Ensure all existing categories in profile are represented plus defaults
  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...allSkills.map((s) => s.category)])
  )

  const handleAddSkill = async (category: string) => {
    const raw = (newSkillInput[category] || '').trim()
    if (!raw) return

    // If multiple comma-separated items entered in the inline input
    const names = Array.from(
      new Set(
        raw
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      )
    )

    const existingNames = new Set(allSkills.map((s) => s.name.toLowerCase()))
    const newItems: SkillItem[] = names
      .filter((n) => !existingNames.has(n.toLowerCase()))
      .map((name) => ({
        id: `sk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        category,
      }))

    if (newItems.length > 0) {
      await saveSkills.mutateAsync([...allSkills, ...newItems])
    }

    setNewSkillInput((prev) => ({ ...prev, [category]: '' }))
  }

  const handleRemoveSkill = async (id: string) => {
    const nextSkills = allSkills.filter((s) => s.id !== id)
    await saveSkills.mutateAsync(nextSkills)
  }

  const handleOpenBulkForCategory = (cat: string) => {
    setTargetCategoryForBulk(cat)
    setBulkDialogOpen(true)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Technical Skills & Proficiencies</CardTitle>
          <CardDescription>
            Categorized technical keywords. ATS parsers match these tokens directly against JD requirements.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenBulkForCategory(categories[0] || 'Languages')}
            className="gap-1.5"
          >
            <ClipboardList className="h-4 w-4" />
            Bulk Paste
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const categorySkills = allSkills.filter((s) => s.category === category)
            const inputValue = newSkillInput[category] || ''

            return (
              <div
                key={category}
                className="rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-border/90 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">{category}</h4>
                    </div>
                    <Badge variant="secondary" className="text-[11px] px-2 py-0">
                      {categorySkills.length}
                    </Badge>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[44px] py-2.5">
                    {categorySkills.length === 0 ? (
                      <span className="text-xs italic text-muted-foreground/60 self-center">
                        No skills in this category yet.
                      </span>
                    ) : (
                      categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-secondary"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="text-muted-foreground hover:text-destructive rounded-full p-0.5"
                            aria-label={`Remove ${skill.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Input */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder={`Add to ${category} (Enter to add)...`}
                    value={inputValue}
                    onChange={(e) =>
                      setNewSkillInput((prev) => ({ ...prev, [category]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill(category)
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAddSkill(category)}
                    className="h-8 px-2.5 text-xs shrink-0"
                    disabled={!inputValue.trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Global Summary Note */}
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3.5 py-2.5 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>
            Total keywords in Knowledge Base: <strong>{allSkills.length}</strong>. The resume compiler selects the top matching subset tailored to each specific job application.
          </span>
        </div>

        <BulkSkillsDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          categories={categories}
          defaultCategory={targetCategoryForBulk}
          onBulkAdd={async (cat, names) => {
            await bulkAddSkills.mutateAsync({ category: cat, names })
          }}
        />
      </CardContent>
    </Card>
  )
}
