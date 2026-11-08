import { useState } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft, FileCode, ChevronDown, ChevronUp, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import type { GenerationStatusError } from '@/types/generation'

interface GenerationErrorCardProps {
  error: GenerationStatusError | null
  onRetry?: () => void
  isRetrying?: boolean
}

export function GenerationErrorCard({
  error,
  onRetry,
  isRetrying = false,
}: GenerationErrorCardProps) {
  const [showLog, setShowLog] = useState(false)
  const code = error?.code || 'GENERATION_FAILED'
  const message = error?.message || 'The resume tailoring or LaTeX compilation process encountered an unexpected issue.'
  const compilerLog = error?.details?.log || error?.details?.rawOutput

  // Map user-friendly suggestions based on error code
  let resolutionHint = 'You can retry generation or inspect the LaTeX template for syntax inconsistencies.'
  if (code === 'COMPILATION_FAILED' || code === 'TEX_SYNTAX_ERROR') {
    resolutionHint = 'pdflatex failed during the compilation step. This usually happens if the active template has unescaped characters or missing LaTeX packages.'
  } else if (code === 'RATE_LIMITED') {
    resolutionHint = 'You reached the generation rate limit. Please wait 30 seconds before retrying.'
  } else if (code === 'TIMEOUT') {
    resolutionHint = 'The compilation microservice timed out. Retrying usually succeeds on subsequent runs.'
  }

  return (
    <Card
      className="border-destructive/40 bg-destructive/5 shadow-sm animate-in fade-in duration-300"
      data-testid="generation-error-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive font-bold flex items-center gap-2">
                <span>Generation Failed</span>
                <Badge variant="destructive" className="font-mono text-[10px] uppercase">
                  {code}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {resolutionHint}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-background border border-border/80 text-xs text-foreground leading-relaxed">
          <p className="font-medium">{message}</p>
        </div>

        {/* Collapsible Compiler Log (FE-4.06) */}
        {compilerLog && (
          <div className="border border-border/80 rounded-lg overflow-hidden bg-muted/30">
            <button
              onClick={() => setShowLog(!showLog)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-mono">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>Compiler Diagnostic Log</span>
                {error?.details?.line && (
                  <span className="text-destructive font-bold">
                    (Line {error.details.line})
                  </span>
                )}
              </div>
              {showLog ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showLog && (
              <div className="p-3 bg-zinc-950 text-zinc-100 font-mono text-[11px] max-h-56 overflow-y-auto space-y-1 border-t border-border/80">
                <pre className="whitespace-pre-wrap break-all leading-tight">
                  {compilerLog}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                variant="default"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="gap-1.5 font-semibold shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying Generation...' : 'Retry Generation'}
              </Button>
            )}

            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to="/generate">
                <ArrowLeft className="h-3.5 w-3.5" />
                Edit Job Details
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
              <Link to="/templates">
                <FileCode className="h-3.5 w-3.5 mr-1" />
                Choose Different Template
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
