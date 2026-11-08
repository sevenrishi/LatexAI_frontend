import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Template } from '@/types/template'

export interface TemplateDeleteDialogProps {
  open: boolean
  template: Template | null
  onOpenChange: (open: boolean) => void
  onConfirm: (template: Template) => void
  isDeleting?: boolean
}

export function TemplateDeleteDialog({
  open,
  template,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: TemplateDeleteDialogProps) {
  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Custom Template</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Are you sure you want to delete <strong className="text-foreground">{template.name}</strong>?
            This will permanently remove your custom LaTeX configurations. Resumes previously generated with
            this template will retain their archived PDFs.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={isDeleting}
            onClick={() => onConfirm(template)}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateDeleteDialog
