import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ExperienceDrawer } from './ExperienceDrawer'
import { Plus, Briefcase, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { FullProfile, ExperienceItem } from '@/types/profile'
import { useExperienceMutations } from '../hooks/useProfile'

interface ExperienceSectionProps {
  profile: FullProfile
}

function formatDateRange(startDate: string, endDate?: string | null, current?: boolean) {
  const format = (str?: string | null) => {
    if (!str) return ''
    const [year, month] = str.split('-')
    if (!month) return year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const mIdx = parseInt(month, 10) - 1
    return `${monthNames[mIdx] || month} ${year}`
  }

  const start = format(startDate)
  const end = current ? 'Present' : format(endDate) || 'Present'
  return `${start} — ${end}`
}

export function ExperienceSection({ profile }: ExperienceSectionProps) {
  const { saveExperience, deleteExperience } = useExperienceMutations()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const rawItems = profile.experience || []
  const seenExpKeys = new Set<string>()
  const items = rawItems.filter((item) => {
    const key = `${(item.company || '').trim().toLowerCase()}::${(item.title || '').trim().toLowerCase()}`
    if (seenExpKeys.has(key)) return false
    seenExpKeys.add(key)
    return true
  })

  const handleOpenAdd = () => {
    setEditingItem(null)
    setDrawerOpen(true)
  }

  const handleOpenEdit = (item: ExperienceItem) => {
    setEditingItem(item)
    setDrawerOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    await deleteExperience.mutateAsync(itemToDelete)
    setItemToDelete(null)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>
            Chronological career history. Each role holds factual bullet points for tailoring against target job descriptions.
          </CardDescription>
        </div>
        <Button onClick={handleOpenAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Add Position
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <Briefcase className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold">No work experience added yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Add your current and past roles, along with measurable achievements and technical responsibilities.
            </p>
            <Button variant="outline" size="sm" onClick={handleOpenAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Your First Role
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-border/90 hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                      <span className="text-muted-foreground">&bull;</span>
                      <span className="font-medium text-foreground/90">{item.company}</span>
                      {item.current && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] py-0 px-2">
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateRange(item.startDate, item.endDate, item.current)}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label="Edit role"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bullets List */}
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="mt-3.5 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground list-disc pl-5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet.id} className="leading-relaxed">
                        <span className="text-foreground/90">{bullet.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Experience Drawer Form */}
        <ExperienceDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          item={editingItem}
          onSave={async (item) => {
            await saveExperience.mutateAsync(item)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => !open && setItemToDelete(null)}
          title="Delete Experience Entry"
          description="Are you sure you want to remove this position from your knowledge base? This action cannot be undone."
          confirmText="Delete Role"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  )
}
