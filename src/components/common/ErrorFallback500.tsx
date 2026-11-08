import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorFallback500Props {
  error?: Error | null
  resetErrorBoundary?: () => void
}

export function ErrorFallback500({
  error,
  resetErrorBoundary,
}: ErrorFallback500Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        An unexpected application error occurred. We have logged this issue and our team is investigating.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left font-mono text-xs text-destructive">
          <p className="font-semibold">Error:</p>
          <p className="break-all">{error.message}</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {resetErrorBoundary ? (
          <Button
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        ) : (
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload page
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Go to Home
        </Button>
      </div>
    </div>
  )
}
