import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ProjectDialog } from './ProjectDialog'
import { Plus, FolderGit2, Globe, Pencil, Trash2 } from 'lucide-react'
import { GithubIcon } from '@/components/common/Icons'
import type { FullProfile, ProjectItem } from '@/types/profile'
import { useProjectMutations } from '../hooks/useProfile'

interface ProjectsSectionProps {
  profile: FullProfile
}

export function ProjectsSection({ profile }: ProjectsSectionProps) {
  const { saveProject, deleteProject } = useProjectMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const items = profile.projects || []

  const handleOpenAdd = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: ProjectItem) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    await deleteProject.mutateAsync(itemToDelete)
    setItemToDelete(null)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Projects & Systems</CardTitle>
          <CardDescription>
            Software repositories, architectural case studies, and engineering projects demonstrating hands-on technical proficiency.
          </CardDescription>
        </div>
        <Button onClick={handleOpenAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold">No projects recorded yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Showcase projects that demonstrate your technical stack, problem solving, and architecture skills.
            </p>
            <Button variant="outline" size="sm" onClick={handleOpenAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-border/90 hover:shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                      {item.role && (
                        <span className="text-xs font-medium text-muted-foreground">
                          &bull; {item.role}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed pt-1 max-w-3xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label="Edit project"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tech Stack Tags */}
                {item.techStack && item.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-[11px] py-0 px-2 font-mono">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Links */}
                {(item.liveUrl || item.repoUrl) && (
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50 text-xs">
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    )}
                    {item.repoUrl && (
                      <a
                        href={item.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        Source Code
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editingItem}
          onSave={async (item) => {
            await saveProject.mutateAsync(item)
          }}
        />

        <ConfirmDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => !open && setItemToDelete(null)}
          title="Delete Project Entry"
          description="Are you sure you want to remove this project from your knowledge base?"
          confirmText="Delete Project"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  )
}
