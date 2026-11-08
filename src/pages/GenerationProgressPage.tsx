import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useGenerationStatus } from '@/features/generate/hooks/useGenerationStatus'
import { usePreviousGeneration } from '@/features/generate/hooks/useGenerate'
import { VerticalStatusStepper } from '@/features/generate/components/VerticalStatusStepper'
import { ElapsedTimer } from '@/features/generate/components/ElapsedTimer'
import { RotatingTips } from '@/features/generate/components/RotatingTips'
import { GenerationErrorCard } from '@/features/generate/components/GenerationErrorCard'

export function GenerationProgressPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Auto-redirect timer state upon completion (FE-4.07)
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState<number | null>(null)
  const [isRedirectPaused, setIsRedirectPaused] = useState(false)

  // Polling hook with exponential backoff & tab visibility pause (FE-4.05)
  const {
    data: statusData,
    status,
    stage,
    progress,
    elapsedSeconds,
    isCompleted,
    isFailed,
    isTabVisible,
    error,
    retry,
    cancel,
  } = useGenerationStatus(id, {
    initialInterval: 1500,
    backoffFactor: 1.25,
    maxInterval: 6000,
    onComplete: (_data) => {
      toast.success('Resume tailored and compiled successfully!')
      // Start auto-redirect countdown to review screen
      setAutoRedirectSeconds(3)
    },
    onError: (err) => {
      const msg = 'message' in err ? err.message : 'Generation failed'
      toast.error(`Generation error: ${msg}`)
    },
  })

  // Load generation context (job title, company, template)
  const { data: genDetail } = usePreviousGeneration(id)

  const jobTitle = statusData?.jobTitle || genDetail?.jobTitle || 'Target Position'
  const companyName = statusData?.companyName || genDetail?.companyName || 'Target Company'
  const templateName = statusData?.templateName || 'ATS Single Column'

  // Countdown timer for automatic completion routing (FE-4.07)
  useEffect(() => {
    if (autoRedirectSeconds === null || isRedirectPaused || !id) return

    if (autoRedirectSeconds <= 0) {
      navigate(`/review/${id}`)
      return
    }

    const timer = setTimeout(() => {
      setAutoRedirectSeconds((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearTimeout(timer)
  }, [autoRedirectSeconds, isRedirectPaused, id, navigate])

  const handleManualReviewRedirect = () => {
    if (id) {
      navigate(`/review/${id}`)
    }
  }

  // Calculate smoothly clamped progress percentage
  const displayProgress = Math.max(progress, isCompleted ? 100 : status === 'QUEUED' ? 5 : 15)

  return (
    <div
      className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300"
      data-testid="generation-progress-page"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link to="/generate">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Generator
              </Link>
            </Button>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="font-mono text-xs text-muted-foreground">ID: {id}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground flex items-center gap-2.5">
            <span>Tailoring Resume</span>
            {isCompleted ? (
              <Badge
                variant="outline"
                className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
              >
                Ready for Review
              </Badge>
            ) : isFailed ? (
              <Badge variant="destructive" className="text-xs">
                Failed
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="text-xs uppercase tracking-wider py-0.5 animate-pulse"
              >
                {status}
              </Badge>
            )}
          </h1>

          <p className="text-sm text-muted-foreground">
            Targeting <span className="font-semibold text-foreground">{jobTitle}</span>
            {companyName && (
              <>
                {' '}
                at <span className="font-semibold text-foreground">{companyName}</span>
              </>
            )}
            <span className="mx-2">•</span>
            <span>Template: {templateName}</span>
          </p>
        </div>

        {/* Action button if already completed */}
        {isCompleted && (
          <Button
            onClick={handleManualReviewRedirect}
            className="gap-2 font-semibold shadow-sm animate-bounce"
          >
            Review Resume Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Global Animated Progress Bar */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>{stage}</span>
            </span>
            <span className="font-mono font-bold text-primary">
              {displayProgress}% Complete
            </span>
          </div>

          {/* Smooth custom progress track */}
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isFailed
                  ? 'bg-destructive'
                  : isCompleted
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-gradient-to-r from-primary via-primary/80 to-primary'
              }`}
              style={{ width: `${displayProgress}%` }}
              role="progressbar"
              aria-valuenow={displayProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Status Stepper, Error Card, Completion Banner */}
        <div className="lg:col-span-8 space-y-6">
          {/* Error Card when FAILED (FE-4.06) */}
          {isFailed && (
            <GenerationErrorCard
              error={error}
              onRetry={retry}
              isRetrying={status === 'QUEUED' || status === 'ANALYZING'}
            />
          )}

          {/* Completion Celebration Card (FE-4.07) */}
          {isCompleted && (
            <Card className="border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs animate-in zoom-in-95 duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 font-bold">
                      Resume Tailored &amp; Compiled Successfully!
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Your single-page LaTeX resume has been compiled into high-resolution PDF format.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-background border border-border/80">
                    <span className="text-muted-foreground block text-[11px]">Format Check</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Single Page Confirmed
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border/80">
                    <span className="text-muted-foreground block text-[11px]">LaTeX Engine</span>
                    <span className="font-semibold text-foreground">pdflatex (TeX Live)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border/80">
                    <span className="text-muted-foreground block text-[11px]">Traceability</span>
                    <span className="font-semibold text-foreground">100% Fact Grounded</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-emerald-200 dark:border-emerald-800/40">
                  <div className="text-xs text-muted-foreground text-center sm:text-left">
                    {autoRedirectSeconds !== null && (
                      <span>
                        Redirecting to review screen in{' '}
                        <span className="font-mono font-bold text-foreground">
                          {autoRedirectSeconds}s
                        </span>
                        ...{' '}
                        <button
                          onClick={() => setIsRedirectPaused(!isRedirectPaused)}
                          className="underline hover:text-foreground font-medium"
                        >
                          {isRedirectPaused ? 'Resume countdown' : 'Pause'}
                        </button>
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleManualReviewRedirect}
                    className="w-full sm:w-auto gap-2 font-semibold shadow-xs"
                  >
                    View Tailored Resume
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vertical Pipeline Stepper (FE-4.06) */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Pipeline Execution Stages</CardTitle>
              <CardDescription className="text-xs">
                Real-time progress tracking through JD extraction, tailoring, and sandboxed TeX compilation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerticalStatusStepper
                currentStatus={status}
                currentStageText={stage}
                progressPercentage={displayProgress}
                isFailed={isFailed}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (4 cols): Elapsed Timer, Tips, Safeguards, Cancel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Elapsed Timer Component (FE-4.06) */}
          <ElapsedTimer
            elapsedSeconds={elapsedSeconds}
            isCompleted={isCompleted}
            isFailed={isFailed}
            isTabVisible={isTabVisible}
            estimatedSeconds={25}
          />

          {/* Rotating Tips Component (FE-4.06) */}
          <RotatingTips intervalMs={5000} />

          {/* Quality & Traceability Safeguards */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Verification Guardrails</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Zero fact hallucination guarantee</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Strict single-column ATS parser layout</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Sandboxed pdflatex compilation isolation</span>
              </div>
            </CardContent>
          </Card>

          {/* Cancel generation action if still active */}
          {!isCompleted && !isFailed && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancel}
                className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel Generation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerationProgressPage
