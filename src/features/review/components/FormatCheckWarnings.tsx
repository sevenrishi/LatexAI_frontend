import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { AtsFormatChecks } from '@/types/generation'

export interface FormatCheckWarningsProps {
  formatWarnings?: string[]
  checks?: AtsFormatChecks
  className?: string
}

export function FormatCheckWarnings({
  formatWarnings = [],
  checks = {
    singlePage: true,
    standardFonts: true,
    cleanLayout: true,
    contactInfoPresent: true,
  },
  className = '',
}: FormatCheckWarningsProps) {
  const checkItems = [
    {
      id: 'singlePage',
      label: 'Single Page Strict Layout',
      passed: checks.singlePage ?? true,
      description: 'Resume compiles within exactly 1 page to maximize recruiter screen efficiency.',
    },
    {
      id: 'standardFonts',
      label: 'Standard Machine-Readable Fonts',
      passed: checks.standardFonts ?? true,
      description: 'Uses TeX standard OpenType/Type1 fonts fully extractable by optical parsers.',
    },
    {
      id: 'cleanLayout',
      label: 'Single-Column ATS Friendly Hierarchy',
      passed: checks.cleanLayout ?? true,
      description: 'No tables, multi-column blocks, or floating graphic frames that confuse ATS.',
    },
    {
      id: 'contactInfo',
      label: 'Contact Info & Link Accessibility',
      passed: checks.contactInfoPresent ?? true,
      description: 'Email, phone, and profile links are placed in standard machine-detectable header zones.',
    },
  ]

  const allChecksPassed = checkItems.every((c) => c.passed)

  return (
    <Card className={`border-border/70 shadow-xs ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>ATS Format &amp; Structure Checks</span>
          </CardTitle>
          {allChecksPassed && formatWarnings.length === 0 && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              All Layout Checks Passed
            </span>
          )}
        </div>
        <CardDescription className="text-xs">
          Validation checks ensuring resume LaTeX output is 100% parsable by enterprise ATS platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {/* Core Heuristics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {checkItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border text-xs space-y-1 transition-colors ${
                item.passed
                  ? 'bg-muted/30 border-border/70 text-foreground'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              }`}
              data-testid={`format-check-${item.id}`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {item.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <span>{item.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground pl-6">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Format Warnings / Recommendations Alert */}
        {formatWarnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Format &amp; Content Recommendations ({formatWarnings.length})</span>
            </div>
            <div className="space-y-2" data-testid="format-warnings-list">
              {formatWarnings.map((warning, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-foreground flex items-start gap-2.5"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      Recommendation #{index + 1}
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {warning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FormatCheckWarnings
