import type { ProfileCompleteness } from '@/types/profile'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

interface CompletenessRingProps {
  completeness: ProfileCompleteness
  onSelectSection?: (sectionId: string) => void
}

export function CompletenessRing({ completeness, onSelectSection }: CompletenessRingProps) {
  const { percentage, tier, missingSections } = completeness
  const radius = 38
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const tierConfig = {
    strong: {
      label: 'Strong Profile',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      strokeColor: '#10b981',
      description: 'Your profile is rich with data for high-ATS resume generation.',
    },
    good: {
      label: 'Good Progress',
      badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      strokeColor: '#3b82f6',
      description: 'Add a few more sections to unlock peak tailoring accuracy.',
    },
    needs_work: {
      label: 'Incomplete',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      strokeColor: '#f59e0b',
      description: 'Fill in your experience and core skills to build your first tailored resume.',
    },
  }[tier]

  const sectionMapping: Record<string, string> = {
    'Contact info': 'contact',
    'Summary': 'summary',
    'Experience': 'experience',
    'Education': 'education',
    'Skills': 'skills',
    'Projects': 'projects',
    'Certifications': 'certifications',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Progress Ring */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-muted"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={tierConfig.strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-foreground">{percentage}%</span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Ready</span>
          </div>
        </div>

        {/* Status & Narrative */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Knowledge Base Completeness</h3>
            <Badge variant="outline" className={`font-medium ${tierConfig.badgeClass}`}>
              <Sparkles className="mr-1 h-3 w-3" />
              {tierConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">{tierConfig.description}</p>

          {/* Missing Section Chips */}
          {missingSections.length > 0 ? (
            <div className="pt-2">
              <span className="text-xs font-medium text-muted-foreground mr-2">Recommended additions:</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {missingSections.map((secName) => {
                  const targetId = sectionMapping[secName] || 'contact'
                  return (
                    <button
                      key={secName}
                      type="button"
                      onClick={() => onSelectSection?.(targetId)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-amber-400/50 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 transition-colors"
                    >
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      + Add {secName}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              All core career sections are populated! Your resumes will compile with rich citations.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
