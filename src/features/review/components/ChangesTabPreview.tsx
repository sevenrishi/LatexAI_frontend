import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export interface ChangesTabPreviewProps {
  className?: string
}

export function ChangesTabPreview({ className = '' }: ChangesTabPreviewProps) {
  return (
    <div className={`space-y-6 ${className}`} data-testid="changes-tab-preview">
      {/* Overview Card */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI Tailoring Summary &amp; Diff</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Zero Hallucinations Verified
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Review how your profile bullet points were tailored to match the target job description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/80">
              <span className="text-muted-foreground block text-[11px]">Bullets Tailored</span>
              <span className="font-mono text-base font-bold text-foreground">8 of 8</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/80">
              <span className="text-muted-foreground block text-[11px]">Keywords Integrated</span>
              <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">+6 Added</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/80">
              <span className="text-muted-foreground block text-[11px]">Fact Grounding</span>
              <span className="font-mono text-base font-bold text-primary">100% Traceable</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/20 border border-border/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Role-by-Role Change Tracking (Coming in Phase J)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Detailed diff accordions showing original profile sentences versus AI-tailored LaTeX phrases,
              with traceability badges linking every claimed achievement back to your verified profile entries.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangesTabPreview
