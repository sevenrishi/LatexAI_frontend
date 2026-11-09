import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EducationDialog } from './EducationDialog'
import { Plus, GraduationCap, Calendar, MapPin, Pencil, Trash2, Award } from 'lucide-react'
import type { FullProfile, EducationItem } from '@/types/profile'
import { useEducationMutations } from '../hooks/useProfile'

interface EducationSectionProps {
  profile: FullProfile
}

function formatDateRange(startDate?: string, endDate?: string) {
  const format = (str?: string) => {
    if (!str) return ''
    const [year, month] = str.split('-')
    if (!month) return year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const mIdx = parseInt(month, 10) - 1
    return `${monthNames[mIdx] || month} ${year}`
  }

  const start = format(startDate)
  const end = format(endDate)
  if (!start && !end) return ''
  if (!start) return end
  if (!end) return start
  return `${start} — ${end}`
}

export function EducationSection({ profile }: EducationSectionProps) {
  const { saveEducation, deleteEducation } = useEducationMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const rawItems = profile.education || []
  const seenEduKeys = new Set<string>()
  const items = rawItems.filter((item) => {
    const key = `${(item.institution || '').trim().toLowerCase()}::${(item.degree || '').trim().toLowerCase()}`
    if (seenEduKeys.has(key)) return false
    seenEduKeys.add(key)
    return true
  })

  const handleOpenAdd = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: EducationItem) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    await deleteEducation.mutateAsync(itemToDelete)
    setItemToDelete(null)
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Education & Degrees</CardTitle>
          <CardDescription>
            Academic institutions, degrees conferred, fields of study, and collegiate honors.
          </CardDescription>
        </div>
        <Button onClick={handleOpenAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold">No education records added yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Add your university degrees, bootcamps, or secondary academic credentials.
            </p>
            <Button variant="outline" size="sm" onClick={handleOpenAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Academic History
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start justify-between gap-3 rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-border/90 hover:shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-foreground">
                      {item.degree}
                      {item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ''}
                    </h4>
                    {item.gpa && (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                        GPA: {item.gpa}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm font-medium text-foreground/80">{item.institution}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateRange(item.startDate, item.endDate)}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </span>
                    )}
                  </div>

                  {item.honors && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 pt-1">
                      <Award className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.honors}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Edit education"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setItemToDelete(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Delete education"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <EducationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editingItem}
          onSave={async (item) => {
            await saveEducation.mutateAsync(item)
          }}
        />

        <ConfirmDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => !open && setItemToDelete(null)}
          title="Delete Education Entry"
          description="Are you sure you want to remove this education entry from your knowledge base?"
          confirmText="Delete Education"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  )
}
