import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/common/FormField'
import { CharCounter } from '@/components/common/CharCounter'
import { Clipboard, Sparkles, Building, Briefcase, AlertCircle, FileText } from 'lucide-react'

interface JobPasteTabProps {
  jobTitle: string
  onChangeJobTitle: (val: string) => void
  companyName: string
  onChangeCompanyName: (val: string) => void
  jobText: string
  onChangeJobText: (val: string) => void
  onPasteClipboard?: () => void
  onInsertSample?: () => void
}

export function JobPasteTab({
  jobTitle,
  onChangeJobTitle,
  companyName,
  onChangeCompanyName,
  jobText,
  onChangeJobText,
  onPasteClipboard,
  onInsertSample,
}: JobPasteTabProps) {
  const isTooShort = jobText.trim().length > 0 && jobText.trim().length < 50

  return (
    <div className="space-y-5">
      {/* Optional Metadata: Role & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Target Role / Job Title"
          description="E.g., Senior Distributed Systems Engineer"
        >
          <div className="relative">
            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={jobTitle}
              onChange={(e) => onChangeJobTitle(e.target.value)}
              placeholder="Staff Software Engineer"
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
        </FormField>

        <FormField
          label="Company / Organization"
          description="E.g., Capgemini, Anthropic, or OpenAI"
        >
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={companyName}
              onChange={(e) => onChangeCompanyName(e.target.value)}
              placeholder="Stripe, Anthropic, or OpenAI"
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
        </FormField>
      </div>

      {/* Main Job Description Textarea */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Job Description &amp; Requirements Text *
          </label>
          <div className="flex items-center gap-2">
            {onPasteClipboard && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPasteClipboard}
                className="h-7 text-xs gap-1.5"
              >
                <Clipboard className="h-3 w-3" />
                Paste from Clipboard
              </Button>
            )}
            {onInsertSample && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onInsertSample}
                className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
              >
                <Sparkles className="h-3 w-3" />
                Insert Sample JD
              </Button>
            )}
          </div>
        </div>

        <Textarea
          value={jobText}
          onChange={(e) => onChangeJobText(e.target.value)}
          placeholder="Paste full job posting text here. Include the job title, requirements, responsibilities, tech stack, and qualifications... (Minimum 50 characters required for high ATS tailoring precision)"
          className="min-h-[240px] text-xs sm:text-sm leading-relaxed resize-y font-normal"
          maxLength={8000}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          {isTooShort ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Job description is short ({jobText.trim().length}/50 chars minimum). Add more details for optimal keyword matching.
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              Tip: Include responsibilities and requirements for maximum ATS match scoring.
            </span>
          )}

          <CharCounter current={jobText.length} max={8000} />
        </div>
      </div>
    </div>
  )
}
