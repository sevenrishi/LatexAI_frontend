import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, TrendingUp, Layers, GraduationCap, FileCheck } from 'lucide-react'
import type { AtsScoreData } from '@/types/generation'

export interface RequirementCoverageBarsProps {
  scoreData?: AtsScoreData
  className?: string
}

interface CoverageItem {
  id: string
  label: string
  percentage: number
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function RequirementCoverageBars({
  scoreData,
  className = '',
}: RequirementCoverageBarsProps) {
  const breakdown = scoreData?.breakdown || {
    skillsMatch: 95,
    experienceRelevance: 92,
    educationMatch: 90,
    formatCompliance: 100,
  }

  const items: CoverageItem[] = [
    {
      id: 'skills',
      label: 'Skills & Keywords Alignment',
      percentage: breakdown.skillsMatch,
      description: 'High-frequency keywords from JD successfully matched in resume sections',
      icon: Layers,
    },
    {
      id: 'experience',
      label: 'Experience & Scope Relevance',
      percentage: breakdown.experienceRelevance,
      description: 'Career achievements and responsibilities map directly to target role',
      icon: TrendingUp,
    },
    {
      id: 'education',
      label: 'Education & Credentials Fit',
      percentage: breakdown.educationMatch,
      description: 'Degree requirements, certifications, and academic background verified',
      icon: GraduationCap,
    },
    {
      id: 'format',
      label: 'ATS Layout & Parser Parsability',
      percentage: breakdown.formatCompliance ?? 100,
      description: 'Clean single-column structure, standard fonts, and machine-readable text',
      icon: FileCheck,
    },
  ]

  const getBarColor = (pct: number) => {
    if (pct >= 85) return 'bg-emerald-500 dark:bg-emerald-400'
    if (pct >= 70) return 'bg-amber-500 dark:bg-amber-400'
    return 'bg-rose-500 dark:bg-rose-400'
  }

  const getTextColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600 dark:text-emerald-400'
    if (pct >= 70) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  return (
    <Card className={`border-border/70 shadow-xs ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center justify-between">
          <span>Requirement Coverage</span>
          <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Weighted ATS Evaluation
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          Granular alignment scores across the four pillars of ATS algorithm screening
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {items.map((item) => {
          const Icon = item.icon
          const colorClass = getBarColor(item.percentage)
          const textClass = getTextColor(item.percentage)

          return (
            <div key={item.id} className="space-y-1.5" data-testid={`coverage-bar-${item.id}`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${textClass}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  role="progressbar"
                  aria-valuenow={item.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={item.label}
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-tight">
                {item.description}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default RequirementCoverageBars
