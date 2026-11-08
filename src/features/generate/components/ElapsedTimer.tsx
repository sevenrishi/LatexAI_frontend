import { Timer, Clock, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ElapsedTimerProps {
  elapsedSeconds: number
  isCompleted?: boolean
  isFailed?: boolean
  isTabVisible?: boolean
  estimatedSeconds?: number
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function ElapsedTimer({
  elapsedSeconds,
  isCompleted = false,
  isFailed = false,
  isTabVisible = true,
  estimatedSeconds = 25,
}: ElapsedTimerProps) {
  const isRunning = !isCompleted && !isFailed

  return (
    <div
      className="p-4 rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs space-y-3"
      data-testid="elapsed-timer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Timer className="h-4 w-4 text-primary" />
          <span>Execution Time</span>
        </div>

        {isRunning && isTabVisible && (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 font-mono text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        )}

        {isRunning && !isTabVisible && (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 font-mono text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
          >
            <EyeOff className="h-3 w-3" />
            Paused in background
          </Badge>
        )}

        {isCompleted && (
          <Badge
            variant="secondary"
            className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
          >
            Finished in {formatTime(elapsedSeconds)}
          </Badge>
        )}

        {isFailed && (
          <Badge variant="destructive" className="text-[10px] font-mono">
            Stopped
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-xs text-muted-foreground">elapsed</span>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Estimated</span>
          <span className="text-xs font-medium text-foreground flex items-center justify-end gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            ~{estimatedSeconds}s
          </span>
        </div>
      </div>

      {isRunning && !isTabVisible && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded border border-amber-200/50 dark:border-amber-900/30">
          Background tab detected: Polling is temporarily paused to save battery and network bandwidth. Polling will immediately resume when you return to this tab.
        </p>
      )}
    </div>
  )
}
