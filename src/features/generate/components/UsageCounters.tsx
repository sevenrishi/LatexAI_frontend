import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, AlertTriangle } from 'lucide-react'
import type { GenerationUsage } from '@/types/generation'

interface UsageCountersProps {
  usage?: GenerationUsage
  isLoading?: boolean
}

export function UsageCounters({ usage, isLoading }: UsageCountersProps) {
  if (isLoading || !usage) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-6 w-24 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>
    )
  }

  const { dailyLimit, usedToday, remainingToday } = usage
  const isExhausted = remainingToday <= 0
  const percentUsed = Math.min(100, Math.round((usedToday / dailyLimit) * 100))

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 shadow-xs">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground">
          {remainingToday} of {dailyLimit}
        </span>
        <span className="text-muted-foreground">remaining today</span>
      </div>

      <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
        <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isExhausted ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          {percentUsed}%
        </span>
      </div>

      {isExhausted ? (
        <Badge variant="destructive" className="gap-1 text-[11px] font-semibold py-0.5">
          <AlertTriangle className="h-3 w-3" />
          Limit Reached
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1 text-[11px] font-normal py-0.5">
          <Zap className="h-3 w-3 text-amber-500" />
          Daily Quota
        </Badge>
      )}
    </div>
  )
}
