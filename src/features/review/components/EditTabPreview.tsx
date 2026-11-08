import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit3, Sparkles } from 'lucide-react'

export interface EditTabPreviewProps {
  onMarkEdited?: () => void
  isOutOfDate?: boolean
  className?: string
}

export function EditTabPreview({
  onMarkEdited,
  isOutOfDate = false,
  className = '',
}: EditTabPreviewProps) {
  return (
    <div className={`space-y-6 ${className}`} data-testid="edit-tab-preview">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              <span>Structured Content Editor</span>
            </CardTitle>
            {isOutOfDate && (
              <Badge variant="warning" className="text-xs">
                Changes pending compilation
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Fine-tune tailored resume bullet points, professional summary, and section ordering before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/20 border border-border/60 text-xs space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Direct LaTeX &amp; Section Fine-Tuning (Phase J)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Structured input fields for your summary, work experience bullets, skills categories, and projects.
              Saving edits automatically queues a sandboxed `pdflatex` compilation step to refresh your PDF.
            </p>
            {onMarkEdited && !isOutOfDate && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onMarkEdited}
                  className="text-xs gap-1.5"
                  data-testid="simulate-edit-button"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Simulate Section Edit (Sets Out-of-Date State)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditTabPreview
