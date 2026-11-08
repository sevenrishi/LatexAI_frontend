import { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  Briefcase,
  Code2,
  FolderGit2,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CharCounter } from '@/components/common/CharCounter'
import { TagInput } from '@/components/common/TagInput'
import { toast } from 'sonner'
import type { TailoredContent } from '@/types/generation'
import {
  usePatchGenerationContent,
  useResetGenerationContent,
  useRerenderGeneration,
} from '@/features/generate/hooks/useGenerate'

export interface EditTabProps {
  generationId: string
  initialContent?: TailoredContent
  isOutOfDate?: boolean
  onSavedAndRerender?: () => void
  onMarkEdited?: () => void
  className?: string
}

const DEFAULT_TAILORED_CONTENT: TailoredContent = {
  summary:
    'Senior Full Stack & Distributed Systems Engineer with 6+ years designing high-throughput payment architectures, resilient microservices, and developer-facing APIs in TypeScript, React, Go, and PostgreSQL. Proven track record scaling platforms to millions of daily transactions with 99.99% uptime.',
  experience: [
    {
      id: 'exp_stripe_01',
      roleTitle: 'Senior Software Engineer',
      companyName: 'FinTech Cloud Inc.',
      period: '2022 - Present',
      bullets: [
        'Architected distributed payment processing microservices using TypeScript, Node.js, and PostgreSQL, handling 2.5M daily transactions.',
        'Engineered low-latency checkout APIs with Redis caching and query indexing, slashing p99 latency by 42%.',
        'Standardized Docker-based CI/CD pipelines and unit testing suites, achieving 99.98% release uptime and cut deployment duration by half.',
      ],
    },
    {
      id: 'exp_stripe_02',
      roleTitle: 'Full Stack Engineer',
      companyName: 'PlatformWorks',
      period: '2020 - 2022',
      bullets: [
        'Engineered responsive merchant dashboards in React and TypeScript with atomic design patterns, improving user task completion by 35%.',
        'Structured relational data models and automated schema migrations across multi-tenant PostgreSQL clusters.',
      ],
    },
  ],
  skills: {
    'Languages & Core': ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL'],
    'Frameworks & Libraries': ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Next.js'],
    'Databases & Systems': ['PostgreSQL', 'Redis', 'Docker', 'Distributed Systems', 'Git'],
  },
  projects: [
    {
      id: 'proj_stripe_01',
      title: 'Distributed Transaction Ledger',
      technologies: 'Go, PostgreSQL, Docker, Redis',
      bullets: [
        'Implemented double-entry bookkeeping ledger engine with ACID guarantees and idempotent API endpoints.',
        'Benchmarked transaction throughput up to 10,000 ops/second on sandboxed container clusters.',
      ],
    },
  ],
}

export function EditTab({
  generationId,
  initialContent,
  isOutOfDate = false,
  onSavedAndRerender,
  onMarkEdited,
  className = '',
}: EditTabProps) {
  // Local form state
  const [content, setContent] = useState<TailoredContent>(
    initialContent || DEFAULT_TAILORED_CONTENT
  )
  const [isDirty, setIsDirty] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // API mutations
  const patchMutation = usePatchGenerationContent()
  const rerenderMutation = useRerenderGeneration()
  const resetMutation = useResetGenerationContent()

  const isSaving = patchMutation.isPending || rerenderMutation.isPending
  const isResetting = resetMutation.isPending

  // Update local content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent)
      setIsDirty(false)
    }
  }, [initialContent])

  const markDirty = () => {
    setIsDirty(true)
    onMarkEdited?.()
  }

  // --- Handlers for Summary ---
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent((prev) => ({ ...prev, summary: e.target.value }))
    markDirty()
  }

  // --- Handlers for Experience Bullets ---
  const handleBulletChange = (roleIndex: number, bulletIndex: number, text: string) => {
    setContent((prev) => {
      const newExp = [...prev.experience]
      const newBullets = [...newExp[roleIndex].bullets]
      newBullets[bulletIndex] = text
      newExp[roleIndex] = { ...newExp[roleIndex], bullets: newBullets }
      return { ...prev, experience: newExp }
    })
    markDirty()
  }

  const handleAddBullet = (roleIndex: number) => {
    setContent((prev) => {
      const newExp = [...prev.experience]
      const newBullets = [...newExp[roleIndex].bullets, 'New tailored achievement bullet.']
      newExp[roleIndex] = { ...newExp[roleIndex], bullets: newBullets }
      return { ...prev, experience: newExp }
    })
    markDirty()
  }

  const handleDeleteBullet = (roleIndex: number, bulletIndex: number) => {
    setContent((prev) => {
      const newExp = [...prev.experience]
      const newBullets = newExp[roleIndex].bullets.filter((_, i) => i !== bulletIndex)
      newExp[roleIndex] = { ...newExp[roleIndex], bullets: newBullets }
      return { ...prev, experience: newExp }
    })
    markDirty()
  }

  // --- Handlers for Skills ---
  const handleSkillsChange = (category: string, newTags: string[]) => {
    setContent((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: newTags,
      },
    }))
    markDirty()
  }

  // --- Handlers for Projects ---
  const handleProjectBulletChange = (projIndex: number, bulletIndex: number, text: string) => {
    setContent((prev) => {
      const newProjs = [...prev.projects]
      const newBullets = [...newProjs[projIndex].bullets]
      newBullets[bulletIndex] = text
      newProjs[projIndex] = { ...newProjs[projIndex], bullets: newBullets }
      return { ...prev, projects: newProjs }
    })
    markDirty()
  }

  const handleProjectTechChange = (projIndex: number, text: string) => {
    setContent((prev) => {
      const newProjs = [...prev.projects]
      newProjs[projIndex] = { ...newProjs[projIndex], technologies: text }
      return { ...prev, projects: newProjs }
    })
    markDirty()
  }

  // --- Primary Action: Save and Re-render ---
  const handleSaveAndRerender = async () => {
    if (!generationId) return
    try {
      // 1. Patch content
      await patchMutation.mutateAsync({ id: generationId, content })
      // 2. Re-render generation
      await rerenderMutation.mutateAsync(generationId)
      setIsDirty(false)
      toast.success('Resume content saved and PDF recompiled successfully!')
      onSavedAndRerender?.()
    } catch {
      toast.error('Failed to save changes or recompile resume.')
    }
  }

  // --- Secondary Action: Reset to AI version ---
  const handleConfirmReset = async () => {
    if (!generationId) return
    try {
      await resetMutation.mutateAsync(generationId)
      await rerenderMutation.mutateAsync(generationId)
      setContent(initialContent || DEFAULT_TAILORED_CONTENT)
      setIsDirty(false)
      setResetDialogOpen(false)
      toast.success('Restored original AI tailored resume.')
      onSavedAndRerender?.()
    } catch {
      toast.error('Failed to reset content.')
    }
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="edit-tab-preview">
      {onMarkEdited && (
        <button
          type="button"
          onClick={onMarkEdited}
          className="sr-only"
          data-testid="simulate-edit-button"
        >
          Simulate Edit
        </button>
      )}
      <div className="space-y-6" data-testid="edit-tab">
      {/* Top Action Bar & Pending compilation alert */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Content Editor</h2>
            {(isDirty || isOutOfDate) && (
              <Badge variant="warning" className="text-[11px] gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                Uncompiled changes
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Edit text fields, add or remove bullets, and re-render the compiled LaTeX PDF.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetDialogOpen(true)}
            disabled={isSaving || isResetting}
            className="text-xs gap-1.5 flex-1 sm:flex-initial"
            data-testid="reset-ai-button"
          >
            {isResetting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>Reset to AI</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSaveAndRerender}
            disabled={isSaving}
            className="text-xs gap-1.5 font-semibold flex-1 sm:flex-initial"
            data-testid="save-rerender-button"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save &amp; Re-render</span>
          </Button>
        </div>
      </div>

      {/* 1. Professional Summary Field */}
      <Card className="border-border/70 shadow-xs" data-testid="edit-summary-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Professional Summary</span>
            </CardTitle>
            <CharCounter current={content.summary.length} max={500} />
          </div>
          <CardDescription className="text-xs">
            A concise 2-3 sentence overview highlighting relevant expertise and target technologies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.summary}
            onChange={handleSummaryChange}
            rows={4}
            maxLength={500}
            className="text-xs leading-relaxed"
            placeholder="Write your professional summary..."
            data-testid="summary-textarea"
          />
        </CardContent>
      </Card>

      {/* 2. Experience Bullets per Role */}
      <Card className="border-border/70 shadow-xs" data-testid="edit-experience-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Work Experience Bullets</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {content.experience.length} Roles
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Fine-tune action verbs, quantified outcomes, and technical keywords for each position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.experience.map((role, roleIdx) => (
            <div
              key={role.id || roleIdx}
              className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-4"
              data-testid={`edit-role-${role.id}`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/50">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{role.roleTitle}</h3>
                  <p className="text-xs text-muted-foreground">
                    {role.companyName} {role.period && `• ${role.period}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBullet(roleIdx)}
                  className="h-7 text-xs gap-1"
                  data-testid={`add-bullet-${role.id}`}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Bullet</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {role.bullets.map((bullet, bulletIdx) => (
                  <div
                    key={bulletIdx}
                    className="flex items-start gap-2"
                    data-testid={`bullet-row-${role.id}-${bulletIdx}`}
                  >
                    <span className="text-[11px] font-mono text-muted-foreground mt-2 w-5 text-right shrink-0">
                      {bulletIdx + 1}.
                    </span>
                    <Textarea
                      value={bullet}
                      onChange={(e) =>
                        handleBulletChange(roleIdx, bulletIdx, e.target.value)
                      }
                      rows={2}
                      className="text-xs flex-1"
                      placeholder="Achievement bullet..."
                      data-testid={`bullet-input-${role.id}-${bulletIdx}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBullet(roleIdx, bulletIdx)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-1"
                      title="Delete bullet"
                      data-testid={`delete-bullet-${role.id}-${bulletIdx}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Skills Grouped by Category */}
      <Card className="border-border/70 shadow-xs" data-testid="edit-skills-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Skills by Category</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Edit skills tags to be rendered in your resume's technical skills section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(content.skills).map(([category, tags]) => (
            <div key={category} className="space-y-1.5" data-testid={`skills-category-${category}`}>
              <label className="text-xs font-semibold text-foreground">{category}</label>
              <TagInput
                value={tags}
                onChange={(newTags) => handleSkillsChange(category, newTags)}
                placeholder={`Add to ${category}...`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Projects Section */}
      <Card className="border-border/70 shadow-xs" data-testid="edit-projects-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-primary" />
            <span>Featured Projects</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Highlighted personal and open-source projects tailored to the role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.projects.map((proj, projIdx) => (
            <div
              key={proj.id || projIdx}
              className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-3"
              data-testid={`edit-project-${proj.id}`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-foreground">{proj.title}</h3>
                <div className="w-full sm:w-72">
                  <Input
                    value={proj.technologies}
                    onChange={(e) => handleProjectTechChange(projIdx, e.target.value)}
                    placeholder="Technologies (e.g. Go, PostgreSQL)"
                    className="h-7 text-xs"
                    data-testid={`proj-tech-${proj.id}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {proj.bullets.map((bullet, bIdx) => (
                  <Textarea
                    key={bIdx}
                    value={bullet}
                    onChange={(e) =>
                      handleProjectBulletChange(projIdx, bIdx, e.target.value)
                    }
                    rows={2}
                    className="text-xs"
                    placeholder="Project details..."
                    data-testid={`proj-bullet-${proj.id}-${bIdx}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bottom Save CTA */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setResetDialogOpen(true)}
          disabled={isSaving || isResetting}
          className="text-xs gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset to AI</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSaveAndRerender}
          disabled={isSaving}
          className="text-xs gap-1.5 font-semibold"
          data-testid="bottom-save-button"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          <span>Save and Re-render</span>
        </Button>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Reset to AI Tailored Version?"
        description="Are you sure you want to discard your manual edits? This will restore the original AI-tailored resume bullets and professional summary."
        confirmText="Yes, Reset"
        onConfirm={handleConfirmReset}
      />
      </div>
    </div>
  )
}

export default EditTab
