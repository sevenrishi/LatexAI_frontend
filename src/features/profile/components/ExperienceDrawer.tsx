import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/FormField'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MonthYearPicker, type MonthYearPickerValue } from '@/components/common/MonthYearPicker'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Sparkles, Building2, MapPin } from 'lucide-react'
import type { ExperienceItem, ExperienceBullet } from '@/types/profile'

interface ExperienceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: ExperienceItem | null
  onSave: (item: ExperienceItem) => Promise<void>
}

function parseMonthYear(val: string | null | undefined): MonthYearPickerValue {
  if (!val) return {}
  const [year, month] = val.split('-')
  return { year, month }
}

function formatMonthYear(val: MonthYearPickerValue): string {
  if (val.year && val.month) return `${val.year}-${val.month}`
  return val.year || ''
}

// Sortable bullet row component
function SortableBulletItem({
  bullet,
  index,
  onChange,
  onRemove,
}: {
  bullet: ExperienceBullet
  index: number
  onChange: (id: string, text: string) => void
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bullet.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-2 rounded-lg border border-border bg-card p-2.5 transition-shadow ${
        isDragging ? 'shadow-md border-primary ring-1 ring-primary' : 'hover:border-border/80'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab text-muted-foreground hover:text-foreground touch-none shrink-0 p-1"
        aria-label="Drag to reorder bullet"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-1">
        <textarea
          value={bullet.text}
          onChange={(e) => onChange(bullet.id, e.target.value)}
          placeholder={`Bullet ${index + 1}: e.g. Architected distributed stream processing engine, reducing latency by 45%...`}
          rows={2}
          className="w-full resize-none rounded-md bg-transparent p-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex justify-between px-1 text-[11px] text-muted-foreground">
          <span>{bullet.text.length} characters</span>
          {bullet.text.length > 0 && bullet.text.length < 30 && (
            <span className="text-amber-500">Consider adding metrics/outcomes</span>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(bullet.id)}
        className="mt-1 h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        aria-label="Remove bullet"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ExperienceDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: ExperienceDrawerProps) {
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState<MonthYearPickerValue>({})
  const [endDate, setEndDate] = useState<MonthYearPickerValue>({})
  const [current, setCurrent] = useState(false)
  const [bullets, setBullets] = useState<ExperienceBullet[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (item) {
      setCompany(item.company || '')
      setTitle(item.title || '')
      setLocation(item.location || '')
      setStartDate(parseMonthYear(item.startDate))
      setEndDate(parseMonthYear(item.endDate))
      setCurrent(item.current ?? false)
      setBullets(item.bullets || [])
    } else {
      setCompany('')
      setTitle('')
      setLocation('')
      setStartDate({})
      setEndDate({})
      setCurrent(false)
      setBullets([
        {
          id: `b_${Date.now()}_1`,
          text: '',
        },
      ])
    }
    setErrors({})
  }, [item, open])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setBullets((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const handleAddBullet = () => {
    setBullets((prev) => [
      ...prev,
      {
        id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: '',
      },
    ])
  }

  const handleBulletChange = (id: string, text: string) => {
    setBullets((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)))
  }

  const handleRemoveBullet = (id: string) => {
    setBullets((prev) => prev.filter((b) => b.id !== id))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!company.trim()) errs.company = 'Company name is required'
    if (!title.trim()) errs.title = 'Job title is required'
    if (!startDate.year) errs.startDate = 'Start date is required'
    if (!current && !endDate.year) {
      errs.endDate = 'End date is required if not currently working here'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const formattedItem: ExperienceItem = {
        id: item?.id || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        company: company.trim(),
        title: title.trim(),
        location: location.trim(),
        startDate: formatMonthYear(startDate),
        endDate: current ? null : formatMonthYear(endDate),
        current,
        bullets: bullets.filter((b) => b.text.trim().length > 0),
      }

      await onSave(formattedItem)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-xl max-h-screen">
        <SheetHeader>
          <SheetTitle>{item ? 'Edit Experience' : 'Add Work Experience'}</SheetTitle>
          <SheetDescription>
            Specify your role, tenure, and bullet points. Our AI engine uses these facts when generating tailored bullets.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Job Title" id="title" required error={errors.title}>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Software Engineer"
              />
            </FormField>

            <FormField label="Company Name" id="company" required error={errors.company}>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="TechCorp Solutions"
                  className="pl-9"
                />
              </div>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Location" id="exp-location">
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="exp-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA (or Remote)"
                    className="pl-9"
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* Dates & Current Switch */}
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Start Date *</Label>
                <MonthYearPicker
                  value={startDate}
                  onChange={setStartDate}
                  startYear={1980}
                  endYear={new Date().getFullYear()}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">End Date</Label>
                <MonthYearPicker
                  value={endDate}
                  onChange={setEndDate}
                  disabled={current}
                  startYear={1980}
                  endYear={new Date().getFullYear()}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="current-role"
                checked={current}
                onCheckedChange={(checked) => setCurrent(Boolean(checked))}
              />
              <Label htmlFor="current-role" className="text-xs font-medium cursor-pointer">
                I currently work in this role
              </Label>
            </div>
          </div>

          {/* Bullets & Reordering via @dnd-kit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Key Achievements & Bullets</Label>
                <p className="text-xs text-muted-foreground">
                  Drag the handle to reorder bullets by priority.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBullet}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Bullet
              </Button>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>
                Tip: Quantified statements (e.g. &ldquo;Scaled throughput by 300%&rdquo;) score highest in ATS evaluations.
              </span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={bullets.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {bullets.map((bullet, idx) => (
                    <SortableBulletItem
                      key={bullet.id}
                      bullet={bullet}
                      index={idx}
                      onChange={handleBulletChange}
                      onRemove={handleRemoveBullet}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <SheetFooter className="pt-4 border-t border-border flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-28">
              {isSubmitting ? 'Saving...' : 'Save Position'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
