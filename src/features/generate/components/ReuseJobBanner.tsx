import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RotateCcw, ExternalLink, X } from 'lucide-react'
import type { GenerationDetail } from '@/types/generation'

interface ReuseJobBannerProps {
  generation?: GenerationDetail | null
  fromId: string
  onClear: () => void
}

export function ReuseJobBanner({ generation, fromId, onClear }: ReuseJobBannerProps) {
  const roleName = generation?.jobTitle || generation?.companyName ? `${generation?.jobTitle || 'Role'} at ${generation?.companyName || 'Company'}` : `Resume ${fromId}`

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs text-foreground shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <RotateCcw className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              Reusing Job Description:
            </span>
            <span className="font-bold text-primary">{roleName}</span>
            {generation?.atsScore?.overall && (
              <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">
                {generation.atsScore.overall}% ATS
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Inputs pre-filled from previous generation ({fromId}). You can edit or re-tailor below.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Button
          size="sm"
          variant="outline"
          asChild
          className="h-7 text-xs gap-1"
        >
          <Link to={`/review/${fromId}`}>
            <ExternalLink className="h-3 w-3" />
            View Original
          </Link>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear &amp; Start Fresh
        </Button>
      </div>
    </div>
  )
}
