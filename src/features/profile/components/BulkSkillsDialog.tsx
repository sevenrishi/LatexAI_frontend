import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Sparkles } from 'lucide-react'

interface BulkSkillsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  defaultCategory?: string
  onBulkAdd: (category: string, skillNames: string[]) => Promise<void>
}

export function BulkSkillsDialog({
  open,
  onOpenChange,
  categories,
  defaultCategory,
  onBulkAdd,
}: BulkSkillsDialogProps) {
  const [category, setCategory] = useState(defaultCategory || categories[0] || 'Languages')
  const [rawText, setRawText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse items preview
  const parsedItems = Array.from(
    new Set(
      rawText
        .split(/[,;\n\r]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parsedItems.length === 0) return

    setIsSubmitting(true)
    try {
      await onBulkAdd(category, parsedItems)
      setRawText('')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Bulk Paste Skills
          </DialogTitle>
          <DialogDescription>
            Quickly paste a list of skills separated by commas, semicolons, or line breaks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Assign to Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Paste Skills</Label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Python, Golang, Rust, C++, Java, Kotlin"
              rows={4}
              className="resize-none font-mono text-xs"
            />
          </div>

          {/* Preview Parsed Chips */}
          {parsedItems.length > 0 && (
            <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Detected ({parsedItems.length} skills):
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="h-3 w-3" /> Ready to import
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                {parsedItems.map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs py-0.5">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || parsedItems.length === 0}>
              {isSubmitting ? 'Adding...' : `Add ${parsedItems.length} Skills`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
