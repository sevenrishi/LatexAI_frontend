import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AtsScoreData, AtsScoreBreakdown } from '@/types/generation'

export interface AtsScoreGaugeProps {
  scoreData?: AtsScoreData
  overallScore?: number
  className?: string
}

export function AtsScoreGauge({
  scoreData,
  overallScore: propScore,
  className = '',
}: AtsScoreGaugeProps) {
  const score = Math.max(0, Math.min(100, propScore ?? scoreData?.overall ?? 0))
  const [selectedCategory, setSelectedCategory] = useState<keyof AtsScoreBreakdown | null>(null)

  // Color theme based on score thresholds
  const isHigh = score >= 80
  const isModerate = score >= 60 && score < 80

  const theme = isHigh
    ? {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10',
        badge: 'success' as const,
        label: 'High Match Probability',
        description: 'Strong alignment with key job requirements and high ATS screening pass rate.',
        icon: CheckCircle2,
      }
    : isModerate
    ? {
        stroke: '#f59e0b', // amber-500
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        badge: 'warning' as const,
        label: 'Moderate Match',
        description: 'Good foundation with opportunities to incorporate missing high-priority keywords.',
        icon: AlertTriangle,
      }
    : {
        stroke: '#f43f5e', // rose-500
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10',
        badge: 'destructive' as const,
        label: 'Needs Improvement',
        description: 'Missing significant technical keywords and experience relevance criteria.',
        icon: XCircle,
      }

  // SVG circular gauge calculations
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const breakdown: AtsScoreBreakdown = scoreData?.breakdown || {
    skillsMatch: score >= 80 ? 95 : score >= 60 ? 75 : 55,
    experienceRelevance: score >= 80 ? 92 : score >= 60 ? 70 : 50,
    educationMatch: score >= 80 ? 90 : score >= 60 ? 80 : 70,
    formatCompliance: 100,
  }

  const categoryDetails: Record<
    keyof AtsScoreBreakdown,
    { label: string; score: number; desc: string }
  > = {
    skillsMatch: {
      label: 'Skills Alignment',
      score: breakdown.skillsMatch,
      desc: 'Frequency and exact match of technical and soft skills specified in JD.',
    },
    experienceRelevance: {
      label: 'Experience Relevance',
      score: breakdown.experienceRelevance,
      desc: 'Semantic relevance of work experience bullets to the target role responsibilities.',
    },
    educationMatch: {
      label: 'Education Match',
      score: breakdown.educationMatch,
      desc: 'Degree level, field of study, and academic criteria matching the posting.',
    },
    formatCompliance: {
      label: 'Format Compliance',
      score: breakdown.formatCompliance ?? 100,
      desc: 'Single-page adherence, machine-parseable fonts, and standard section headings.',
    },
  }

  const activeCategoryInfo = selectedCategory ? categoryDetails[selectedCategory] : null

  return (
    <Card className={`overflow-hidden border-border/70 shadow-xs ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          {/* Circular SVG Gauge */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <svg
              className="w-40 h-40 transform -rotate-90"
              viewBox="0 0 160 160"
              role="meter"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ATS Match Score Gauge"
            >
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress Stroke */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
                {score}%
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                ATS Score
              </span>
            </div>
          </div>

          {/* Score Details & Verdict */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <Badge variant={theme.badge} className="px-2.5 py-0.5 gap-1.5 text-xs font-semibold">
                  <theme.icon className="h-3.5 w-3.5" />
                  {theme.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (Based on {scoreData?.keywordsMatched?.length ?? 0} matched terms)
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {theme.description}
              </p>
            </div>

            {/* Interactive Breakdown Pills */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Click category for details:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(Object.keys(categoryDetails) as Array<keyof AtsScoreBreakdown>).map((catKey) => {
                  const item = categoryDetails[catKey]
                  const isSelected = selectedCategory === catKey
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : catKey)
                      }
                      className={`p-2 rounded-md border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                      data-testid={`gauge-category-${catKey}`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="truncate pr-1 text-[11px]">{item.label}</span>
                        <span
                          className={`font-mono text-xs font-bold ${
                            item.score >= 85
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.score >= 70
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.score}%
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Expanded Active Category Inspector */}
            {activeCategoryInfo && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {activeCategoryInfo.label} Breakdown
                  </span>
                  <span className="font-mono text-primary font-bold">
                    {activeCategoryInfo.score}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {activeCategoryInfo.desc}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AtsScoreGauge
