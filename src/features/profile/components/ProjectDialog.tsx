import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/common/FormField'
import { TagInput } from '@/components/common/TagInput'
import { FolderGit2, Globe } from 'lucide-react'
import { GithubIcon } from '@/components/common/Icons'
import type { ProjectItem } from '@/types/profile'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: ProjectItem | null
  onSave: (item: ProjectItem) => Promise<void>
}

export function ProjectDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: ProjectDialogProps) {
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [liveUrl, setLiveUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setTitle(item.title || '')
      setRole(item.role || '')
      setDescription(item.description || '')
      setTechStack(item.techStack || [])
      setLiveUrl(item.liveUrl || '')
      setRepoUrl(item.repoUrl || '')
    } else {
      setTitle('')
      setRole('')
      setDescription('')
      setTechStack([])
      setLiveUrl('')
      setRepoUrl('')
    }
    setErrors({})
  }, [item, open])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Project title is required'
    if (!description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const formatted: ProjectItem = {
        id: item?.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim(),
        role: role.trim() || undefined,
        description: description.trim(),
        techStack,
        liveUrl: liveUrl.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
      }

      await onSave(formatted)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Project' : 'Add Technical Project'}</DialogTitle>
          <DialogDescription>
            Highlight personal builds, open-source repositories, or system architecture case studies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <FormField label="Project Title" id="proj-title" required error={errors.title}>
            <div className="relative">
              <FolderGit2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="proj-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Distributed Task Queue (Go & Redis)"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label="Your Role / Contribution" id="proj-role" description="e.g. Creator & Lead Engineer">
            <Input
              id="proj-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Creator & Maintainer"
            />
          </FormField>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold block text-foreground">
              Technologies & Tools (Tech Stack)
            </label>
            <TagInput
              value={techStack}
              onChange={setTechStack}
              placeholder="Type technology (e.g. Go, Docker, gRPC) and press Enter..."
            />
          </div>

          <FormField label="Project Description & Impact" id="proj-desc" required error={errors.description}>
            <Textarea
              id="proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, architectural choices, and performance/scale outcomes..."
              rows={4}
              className="resize-none text-xs leading-relaxed"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Live Demo URL" id="liveUrl">
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="liveUrl"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="pl-9"
                />
              </div>
            </FormField>

            <FormField label="Repository URL" id="repoUrl">
              <div className="relative">
                <GithubIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="pl-9"
                />
              </div>
            </FormField>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
