import { Info } from 'lucide-react'

export interface AtsDisclaimerNoteProps {
  className?: string
}

export function AtsDisclaimerNote({ className = '' }: AtsDisclaimerNoteProps) {
  return (
    <div
      className={`p-3.5 rounded-lg bg-muted/40 border border-border/80 text-xs text-muted-foreground flex items-start gap-2.5 leading-relaxed ${className}`}
      data-testid="ats-disclaimer-note"
    >
      <Info className="h-4 w-4 text-primary/70 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold text-foreground text-[11px]">
          ATS Scoring Methodology &amp; Disclaimer
        </p>
        <p className="text-[11px] text-muted-foreground">
          ATS match scores are estimated using algorithmic keyword density, semantic requirement
          alignment, and layout parsing heuristics calibrated against major enterprise Applicant
          Tracking Systems (e.g., Workday, Greenhouse, Lever, Taleo). Scores of 80%+ substantially
          improve machine-screening callback odds, but hiring team decisions incorporate qualitative
          portfolio assessments and interview evaluations.
        </p>
      </div>
    </div>
  )
}

export default AtsDisclaimerNote
