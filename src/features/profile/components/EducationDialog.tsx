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
import { FormField } from '@/components/common/FormField'
import { Label } from '@/components/ui/label'
import { MonthYearPicker, type MonthYearPickerValue } from '@/components/common/MonthYearPicker'
import { GraduationCap, Award, MapPin } from 'lucide-react'
import type { EducationItem } from '@/types/profile'

interface EducationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: EducationItem | null
  onSave: (item: EducationItem) => Promise<void>
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

export function EducationDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: EducationDialogProps) {
  const [institution, setInstitution] = useState('')
  const [degree, setDegree] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState<MonthYearPickerValue>({})
  const [endDate, setEndDate] = useState<MonthYearPickerValue>({})
  const [gpa, setGpa] = useState('')
  const [honors, setHonors] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setInstitution(item.institution || '')
      setDegree(item.degree || '')
      setFieldOfStudy(item.fieldOfStudy || '')
      setLocation(item.location || '')
      setStartDate(parseMonthYear(item.startDate))
      setEndDate(parseMonthYear(item.endDate))
      setGpa(item.gpa || '')
      setHonors(item.honors || '')
    } else {
      setInstitution('')
      setDegree('')
      setFieldOfStudy('')
      setLocation('')
      setStartDate({})
      setEndDate({})
      setGpa('')
      setHonors('')
    }
    setErrors({})
  }, [item, open])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!institution.trim()) errs.institution = 'Institution is required'
    if (!degree.trim()) errs.degree = 'Degree is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const formatted: EducationItem = {
        id: item?.id || `edu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        institution: institution.trim(),
        degree: degree.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        location: location.trim(),
        startDate: formatMonthYear(startDate),
        endDate: formatMonthYear(endDate),
        gpa: gpa.trim() || undefined,
        honors: honors.trim() || undefined,
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
          <DialogTitle>{item ? 'Edit Education' : 'Add Education'}</DialogTitle>
          <DialogDescription>
            Enter your degree, academic institution, graduation year, and any honors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <FormField label="Institution / University" id="institution" required error={errors.institution}>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University of California, Berkeley"
                className="pl-9"
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Degree" id="degree" required error={errors.degree}>
              <Input
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Bachelor of Science"
              />
            </FormField>

            <FormField label="Field of Study" id="fieldOfStudy">
              <Input
                id="fieldOfStudy"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="Computer Science"
              />
            </FormField>
          </div>

          <FormField label="Location" id="edu-location">
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="edu-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Berkeley, CA"
                className="pl-9"
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Start Date</Label>
              <MonthYearPicker
                value={startDate}
                onChange={setStartDate}
                startYear={1975}
                endYear={new Date().getFullYear() + 6}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Graduation Date</Label>
              <MonthYearPicker
                value={endDate}
                onChange={setEndDate}
                startYear={1975}
                endYear={new Date().getFullYear() + 6}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="GPA (Optional)" id="gpa" description="e.g. 3.85 / 4.0">
              <Input
                id="gpa"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="3.85"
              />
            </FormField>

            <FormField label="Honors / Awards" id="honors" description="Optional accolades">
              <div className="relative">
                <Award className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="honors"
                  value={honors}
                  onChange={(e) => setHonors(e.target.value)}
                  placeholder="Summa Cum Laude"
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
              {isSubmitting ? 'Saving...' : 'Save Education'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
