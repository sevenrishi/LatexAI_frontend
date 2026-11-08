import { cn } from '@/lib/utils'

export interface CharCounterProps {
  current: number
  max: number
  className?: string
}

export function CharCounter({ current, max, className }: CharCounterProps) {
  const isNearLimit = current >= max * 0.9
  const isOverLimit = current > max

  return (
    <div
      className={cn(
        'text-right text-xs transition-colors duration-200',
        isOverLimit
          ? 'font-bold text-destructive'
          : isNearLimit
            ? 'font-medium text-amber-500 dark:text-amber-400'
            : 'text-muted-foreground',
        className
      )}
      aria-live="polite"
    >
      <span>{current}</span> / <span>{max}</span>
    </div>
  )
}
