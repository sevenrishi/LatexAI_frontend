import React from 'react'
import { CheckCircle2, Loader2, AlertCircle, FileSearch, Sparkles, FileCode2, Binary, CheckCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { GenerationStatus } from '@/types/generation'

export interface PipelineStep {
  id: string
  statusKey: GenerationStatus
  stepNumber: number
  title: string
  description: string
  subTasks: string[]
  icon: React.ComponentType<{ className?: string }>
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'analyzing',
    statusKey: 'ANALYZING',
    stepNumber: 1,
    title: 'JD Analysis & Keyword Extraction',
    description: 'Deconstructing requirements, seniority level, and core technical domain keywords.',
    subTasks: [
      'Extracting core technical skills & proficiencies',
      'Determining role scope, seniority, and responsibilities',
      'Synthesizing ATS semantic match requirements',
    ],
    icon: FileSearch,
  },
  {
    id: 'tailoring',
    statusKey: 'TAILORING',
    stepNumber: 2,
    title: 'Fact-Grounded Experience Tailoring',
    description: 'Grounding bullet points in your verified profile with strict source-fact traceability.',
    subTasks: [
      'Selecting highest-impact achievements from verified profile',
      'Rewriting bullets with strong action verbs & quantifiable metrics',
      'Running automated fact-checking guardrails (zero fabricated claims)',
    ],
    icon: Sparkles,
  },
  {
    id: 'rendering',
    statusKey: 'RENDERING',
    stepNumber: 3,
    title: 'LaTeX Layout & Typography Balancing',
    description: 'Populating ATS-friendly single-column LaTeX markup with dynamic spacing constraints.',
    subTasks: [
      'Injecting tailored sections into LaTeX template placeholders',
      'Optimizing vertical spacing to strictly enforce one-page format',
      'Sanitizing and escaping special LaTeX characters and symbols',
    ],
    icon: FileCode2,
  },
  {
    id: 'compiling',
    statusKey: 'COMPILING',
    stepNumber: 4,
    title: 'Sandboxed TeX Live PDF Compilation',
    description: 'Running pdflatex inside an isolated container with font embedding.',
    subTasks: [
      'Invoking sandboxed pdflatex compiler environment',
      'Inspecting compilation log outputs and cross-references',
      'Generating vector-rendered, ATS-parseable PDF stream',
    ],
    icon: Binary,
  },
  {
    id: 'completed',
    statusKey: 'COMPLETED',
    stepNumber: 5,
    title: 'ATS Verification & Ready for Review',
    description: 'Performing post-compile text audit, keyword scoring, and generating artifacts.',
    subTasks: [
      'Verifying text extractability from compiled PDF',
      'Computing weighted ATS keyword coverage score',
      'Packaging downloadable .pdf and .tex source bundles',
    ],
    icon: CheckCheck,
  },
]

// Status order for comparison
const STATUS_ORDER: Record<GenerationStatus, number> = {
  QUEUED: 0,
  ANALYZING: 1,
  TAILORING: 2,
  RENDERING: 3,
  COMPILING: 4,
  COMPLETED: 5,
  FAILED: -1,
}

interface VerticalStatusStepperProps {
  currentStatus: GenerationStatus
  currentStageText?: string
  progressPercentage?: number
  isFailed?: boolean
}

export function VerticalStatusStepper({
  currentStatus,
  currentStageText,
  progressPercentage: _progressPercentage,
  isFailed = false,
}: VerticalStatusStepperProps) {
  const currentOrder = STATUS_ORDER[currentStatus] ?? 0

  return (
    <div className="space-y-6" data-testid="vertical-status-stepper">
      <div className="relative">
        {PIPELINE_STEPS.map((step, index) => {
          const stepOrder = step.stepNumber
          const isPast = !isFailed && currentOrder > stepOrder
          const isCurrent = !isFailed && (currentOrder === stepOrder || (currentStatus === 'QUEUED' && stepOrder === 1))
          const isPending = !isFailed && currentOrder < stepOrder
          const isStepFailed = isFailed && currentOrder === stepOrder
          const isLast = index === PIPELINE_STEPS.length - 1
          const StepIcon = step.icon

          return (
            <div key={step.id} className="relative flex items-start group">
              {/* Connecting Line between steps */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 -bottom-2 w-0.5 transition-colors duration-500 ${
                    isPast
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : isCurrent
                      ? 'bg-gradient-to-b from-primary to-border dark:from-primary dark:to-border/40'
                      : 'bg-border/60'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Icon / Circle Indicator */}
              <div className="relative z-10 flex-shrink-0 mr-4">
                {isPast ? (
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm transition-all duration-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : isStepFailed ? (
                  <div className="h-10 w-10 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center text-destructive shadow-sm animate-pulse">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : isCurrent ? (
                  <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-md shadow-primary/20 ring-4 ring-primary/15 transition-all duration-300">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted/60 border border-border flex items-center justify-center text-muted-foreground font-semibold text-xs transition-colors">
                    <span>{step.stepNumber}</span>
                  </div>
                )}
              </div>

              {/* Step Content Card */}
              <div
                className={`flex-1 pb-8 transition-opacity duration-300 ${
                  isPending ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isCurrent
                          ? 'text-primary'
                          : isPast
                          ? 'text-foreground'
                          : isStepFailed
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </span>

                    {/* Step Status Badges */}
                    {isCurrent && (
                      <Badge
                        variant="default"
                        className="text-[10px] uppercase tracking-wider py-0 px-2 font-semibold shadow-xs animate-pulse"
                      >
                        In Progress
                      </Badge>
                    )}
                    {isPast && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 py-0 px-2 font-medium"
                      >
                        Completed
                      </Badge>
                    )}
                    {isStepFailed && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-2 font-medium">
                        Failed Here
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground font-mono">
                    Step {step.stepNumber} of 5
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.description}
                </p>

                {/* Active Stage Live Indicator */}
                {isCurrent && currentStageText && (
                  <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 dark:bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                    <StepIcon className="h-3.5 w-3.5 shrink-0 animate-pulse text-primary" />
                    <span className="truncate">{currentStageText}</span>
                  </div>
                )}

                {/* Subtasks checklist */}
                <div className="mt-2.5 space-y-1">
                  {step.subTasks.map((sub, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-[11px] ${
                        isPast
                          ? 'text-muted-foreground line-through opacity-75'
                          : isCurrent
                          ? 'text-foreground font-normal'
                          : 'text-muted-foreground/70'
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPast
                            ? 'bg-emerald-500'
                            : isCurrent
                            ? 'bg-primary animate-ping'
                            : 'bg-border'
                        }`}
                      />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
