import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/common/FormField'
import {
  Globe,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building,
  Briefcase,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { JobFetchResponse } from '@/types/generation'

interface JobUrlTabProps {
  jobUrl: string
  onChangeUrl: (url: string) => void
  onFetch: () => void
  isFetching: boolean
  extractedData: JobFetchResponse | null
  onUseExtracted: (data: JobFetchResponse) => void
  onClearExtracted: () => void
}

export function JobUrlTab({
  jobUrl,
  onChangeUrl,
  onFetch,
  isFetching,
  extractedData,
  onUseExtracted,
  onClearExtracted,
}: JobUrlTabProps) {
  const [showFullText, setShowFullText] = useState(false)

  const sampleUrls = [
    { label: 'Anthropic Lever Posting', url: 'https://jobs.lever.co/anthropic/systems-engineer' },
    { label: 'Stripe Careers', url: 'https://stripe.com/jobs/staff-infrastructure' },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <FormField
          label="Target Job Posting Link"
          description="We safely fetch and extract job requirements from major boards (Lever, Greenhouse, Ashby, Workday, etc.)."
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                value={jobUrl}
                onChange={(e) => onChangeUrl(e.target.value)}
                placeholder="https://jobs.lever.co/company/role"
                className="pl-9 h-10"
                disabled={isFetching}
              />
            </div>
            <Button
              type="button"
              onClick={onFetch}
              disabled={!jobUrl.trim() || isFetching}
              className="gap-2 sm:w-auto h-10 px-5 shadow-xs font-semibold"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching Job...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract JD
                </>
              )}
            </Button>
          </div>
        </FormField>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Try sample:</span>
          {sampleUrls.map((sample) => (
            <button
              key={sample.url}
              type="button"
              onClick={() => {
                onChangeUrl(sample.url)
              }}
              className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Extraction Preview Card */}
      {extractedData && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Job Extracted Successfully
                  <Badge variant="success" className="text-[10px] py-0 px-1.5">
                    Live Preview
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Extracted from <span className="font-mono">{new URL(extractedData.url).hostname}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearExtracted}
                className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onUseExtracted(extractedData)}
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
              >
                Use Extracted Text
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {extractedData.jobTitle && (
              <div className="flex items-center gap-2 rounded-lg bg-card/60 border border-border/60 p-2.5">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Role</span>
                  <span className="font-bold text-foreground truncate block">
                    {extractedData.jobTitle}
                  </span>
                </div>
              </div>
            )}

            {extractedData.companyName && (
              <div className="flex items-center gap-2 rounded-lg bg-card/60 border border-border/60 p-2.5">
                <Building className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Company</span>
                  <span className="font-bold text-foreground truncate block">
                    {extractedData.companyName}
                  </span>
                </div>
              </div>
            )}

            {extractedData.location && (
              <div className="flex items-center gap-2 rounded-lg bg-card/60 border border-border/60 p-2.5">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Location</span>
                  <span className="font-bold text-foreground truncate block">
                    {extractedData.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Extracted Keywords Chips */}
          {extractedData.extractedKeywords && extractedData.extractedKeywords.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Target Requirements &amp; Keywords Detected:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.extractedKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="text-xs bg-card/80 border border-border/60 font-medium"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible raw text preview */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowFullText(!showFullText)}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {showFullText ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Extracted Job Text
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Full Extracted Job Text ({extractedData.jobText.length} chars)
                </>
              )}
            </button>

            {showFullText && (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-border/70 bg-card p-3 font-mono text-xs text-muted-foreground leading-relaxed">
                {extractedData.jobText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
