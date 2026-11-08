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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MonthYearPicker, type MonthYearPickerValue } from '@/components/common/MonthYearPicker'
import { Award, Building, ExternalLink, Hash } from 'lucide-react'
import type { CertificationItem } from '@/types/profile'

interface CertificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: CertificationItem | null
  onSave: (item: CertificationItem) => Promise<void>
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

export function CertificationDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: CertificationDialogProps) {
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [issueDate, setIssueDate] = useState<MonthYearPickerValue>({})
  const [expiryDate, setExpiryDate] = useState<MonthYearPickerValue>({})
  const [doesNotExpire, setDoesNotExpire] = useState(false)
  const [credentialId, setCredentialId] = useState('')
  const [credentialUrl, setCredentialUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setName(item.name || '')
      setIssuer(item.issuer || '')
      setIssueDate(parseMonthYear(item.issueDate))
      setExpiryDate(parseMonthYear(item.expiryDate))
      setDoesNotExpire(item.doesNotExpire ?? false)
      setCredentialId(item.credentialId || '')
      setCredentialUrl(item.credentialUrl || '')
    } else {
      setName('')
      setIssuer('')
      setIssueDate({})
      setExpiryDate({})
      setDoesNotExpire(false)
      setCredentialId('')
      setCredentialUrl('')
    }
    setErrors({})
  }, [item, open])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Certification name is required'
    if (!issuer.trim()) errs.issuer = 'Issuing organization is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const formatted: CertificationItem = {
        id: item?.id || `cert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        issuer: issuer.trim(),
        issueDate: formatMonthYear(issueDate),
        expiryDate: doesNotExpire ? null : formatMonthYear(expiryDate) || null,
        doesNotExpire,
        credentialId: credentialId.trim() || undefined,
        credentialUrl: credentialUrl.trim() || undefined,
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
          <DialogTitle>{item ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
          <DialogDescription>
            Document professional credentials, cloud certifications, or specialized licenses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <FormField label="Certification Name" id="cert-name" required error={errors.name}>
            <div className="relative">
              <Award className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="cert-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AWS Certified Solutions Architect – Associate"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label="Issuing Organization" id="cert-issuer" required error={errors.issuer}>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="cert-issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Amazon Web Services"
                className="pl-9"
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Issue Date</Label>
              <MonthYearPicker
                value={issueDate}
                onChange={setIssueDate}
                startYear={1990}
                endYear={new Date().getFullYear()}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Expiry Date</Label>
              <MonthYearPicker
                value={expiryDate}
                onChange={setExpiryDate}
                disabled={doesNotExpire}
                startYear={1990}
                endYear={new Date().getFullYear() + 10}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="does-not-expire"
              checked={doesNotExpire}
              onCheckedChange={(checked) => setDoesNotExpire(Boolean(checked))}
            />
            <Label htmlFor="does-not-expire" className="text-xs font-medium cursor-pointer">
              This certification does not expire
            </Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <FormField label="Credential ID" id="credentialId">
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="credentialId"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  placeholder="AWS-839210-AS"
                  className="pl-9"
                />
              </div>
            </FormField>

            <FormField label="Verification URL" id="credentialUrl">
              <div className="relative">
                <ExternalLink className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="credentialUrl"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  placeholder="https://..."
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
              {isSubmitting ? 'Saving...' : 'Save Certification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
