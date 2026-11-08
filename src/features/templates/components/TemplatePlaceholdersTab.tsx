import { useState } from 'react'
import {
  Check,
  AlertCircle,
  Copy,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { STANDARD_PLACEHOLDERS, checkPlaceholderCoverage } from '../utils/placeholders'
import { toast } from 'sonner'

export interface TemplatePlaceholdersTabProps {
  latexSource: string
  onInsertPlaceholder?: (token: string) => void
  readOnly?: boolean
}

export function TemplatePlaceholdersTab({
  latexSource,
  onInsertPlaceholder,
  readOnly = false,
}: TemplatePlaceholdersTabProps) {
  const [search, setSearch] = useState('')

  const coverage = checkPlaceholderCoverage(latexSource)

  const filtered = STANDARD_PLACEHOLDERS.filter((ph) => {
    const q = search.toLowerCase()
    return (
      ph.token.toLowerCase().includes(q) ||
      ph.label.toLowerCase().includes(q) ||
      ph.description.toLowerCase().includes(q) ||
      ph.category.toLowerCase().includes(q)
    )
  })

  const copySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet)
    toast.success('LaTeX snippet copied to clipboard')
  }

  return (
    <div className="space-y-4">
      {/* Coverage Status Card */}
      <div className="p-4 rounded-lg border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Placeholder Contract Coverage</h3>
            {coverage.isComplete ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> All Required Included
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" /> {coverage.missingRequired.length} Required Missing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Standard placeholders allow the LatexAI AI pipeline and profile renderer to inject structured content.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            <strong>{coverage.covered.length}</strong> of {STANDARD_PLACEHOLDERS.length} active
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search placeholders by name, token, or section..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-xs h-9"
        />
      </div>

      {/* Placeholders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ph) => {
          const isPresent = coverage.presentTokens.has(ph.token)

          return (
            <div
              key={ph.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isPresent
                  ? 'bg-card border-border/80'
                  : ph.required
                  ? 'bg-destructive/5 border-destructive/20'
                  : 'bg-card/50 border-border/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {ph.token}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {ph.category}
                    </Badge>
                    {ph.required && (
                      <span className="text-[10px] font-medium text-destructive">Required</span>
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-foreground">{ph.label}</h4>
                  <p className="text-[11px] text-muted-foreground">{ph.description}</p>
                </div>

                <div className="shrink-0 flex items-center">
                  {isPresent ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 py-0.5"
                    >
                      <Check className="h-3 w-3" /> Present
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-[10px] gap-1 py-0.5 ${
                        ph.required
                          ? 'bg-destructive/10 text-destructive border-destructive/30'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <AlertCircle className="h-3 w-3" /> Missing
                    </Badge>
                  )}
                </div>
              </div>

              {/* Code Snippet and Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-muted-foreground truncate bg-muted/60 px-2 py-0.5 rounded max-w-[200px]">
                  {ph.exampleSnippet.split('\n')[0]}
                </code>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1"
                    onClick={() => copySnippet(ph.exampleSnippet)}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  {!readOnly && onInsertPlaceholder && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
                      onClick={() => onInsertPlaceholder(ph.token)}
                    >
                      <PlusCircle className="h-3 w-3" />
                      Insert
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TemplatePlaceholdersTab
