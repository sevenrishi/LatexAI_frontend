import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, Clock, ShieldAlert, History, UserCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActionableErrorCardProps {
  code?: string
  message?: string
  details?: unknown
  onRetry?: () => void
  onDismiss?: () => void
}

export function ActionableErrorCard({
  code,
  message,
  onRetry,
  onDismiss,
}: ActionableErrorCardProps) {
  if (!code && !message) return null

  // Profile Incomplete Error: Provide direct actionable link to /profile
  if (code === 'PROFILE_INCOMPLETE') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400 mt-0.5">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Career Profile Incomplete
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed max-w-xl">
                {message ||
                  'Your profile lacks sufficient verified experience or skills to tailor this resume. Antigravity requires verified ground truth to prevent AI hallucinations.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  asChild
                  className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs text-xs font-semibold"
                >
                  <Link to="/profile">
                    Complete Career Profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-500/10"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="text-amber-700/60 hover:text-amber-900 dark:text-amber-300/60 dark:hover:text-amber-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Quota Exceeded Error: Provide link to /history and quota reset notice
  if (code === 'QUOTA_EXCEEDED') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-destructive/20 p-2 text-destructive mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-destructive">
                Daily Generation Limit Reached (5/5)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {message ||
                  'You have used all 5 tailored resume generations allocated for today. Quota automatically resets at 00:00 UTC.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  asChild
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Link to="/history">
                    <History className="h-3.5 w-3.5" />
                    View Previously Generated Resumes
                  </Link>
                </Button>
                {onDismiss && (
                  <Button size="sm" variant="ghost" onClick={onDismiss} className="text-xs">
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Rate Limited Error: Actionable retry timer
  if (code === 'RATE_LIMITED') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400 mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Rate Limit Exceeded
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed max-w-xl">
                {message ||
                  'Too many tailoring requests received in a short time. Please wait ~30 seconds before retrying.'}
              </p>
              {onRetry && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={onRetry}
                    className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                  >
                    Try Again Now
                  </Button>
                </div>
              )}
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="text-amber-700/60 hover:text-amber-900 dark:text-amber-300/60 dark:hover:text-amber-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Fallback / Bot-blocking notification banner
  if (code === 'URL_BLOCKED' || code === 'URL_FETCH_FAILED') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-950 dark:text-sky-200 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-sky-500/20 p-2 text-sky-600 dark:text-sky-400 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-sky-900 dark:text-sky-100">
                Switched to Text Paste Mode
              </h4>
              <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed max-w-xl">
                {message ||
                  'The job board prevented automated scraping. We have automatically switched you to the "Paste text" tab so you can paste the description directly.'}
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="text-sky-700/60 hover:text-sky-900 dark:text-sky-300/60 dark:hover:text-sky-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Default Generic Error Card
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-destructive/20 p-2 text-destructive mt-0.5">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-destructive">Submission Error</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              {message || 'An unexpected error occurred while processing your job description.'}
            </p>
            {onRetry && (
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={onRetry} className="text-xs">
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
