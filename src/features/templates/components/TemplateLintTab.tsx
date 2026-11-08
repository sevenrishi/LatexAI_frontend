import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { lintTemplate } from '../utils/lintTemplate'
import { LintSeverity } from '@/types/template'

export interface TemplateLintTabProps {
  latexSource: string
  onJumpToLine?: (line: number) => void
}

export function TemplateLintTab({ latexSource, onJumpToLine }: TemplateLintTabProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')

  const issues = useMemo(() => lintTemplate(latexSource), [latexSource])

  const errorCount = issues.filter((i) => i.type === 'error').length
  const warningCount = issues.filter((i) => i.type === 'warning').length

  const filtered = issues.filter((i) => {
    if (filter === 'all') return true
    return i.type === filter
  })

  const getSeverityIcon = (type: LintSeverity) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (type: LintSeverity) => {
    switch (type) {
      case 'error':
        return <Badge variant="destructive" className="text-[10px] uppercase">Error</Badge>
      case 'warning':
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          >
            Warning
          </Badge>
        )
      case 'info':
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
          >
            Info
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Lint Summary Header */}
      <div className="p-4 rounded-lg border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {errorCount === 0 ? (
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
          ) : (
            <div className="p-2.5 rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {errorCount === 0
                ? 'Template Security & Syntax Verified'
                : `${errorCount} Critical Error${errorCount > 1 ? 's' : ''} Found`}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client-side linter enforces sandboxed pdflatex constraints and blocks unsafe shell primitives.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFilter('all')}
          >
            All ({issues.length})
          </Button>
          <Button
            variant={filter === 'error' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFilter('error')}
          >
            Errors ({errorCount})
          </Button>
          <Button
            variant={filter === 'warning' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFilter('warning')}
          >
            Warnings ({warningCount})
          </Button>
        </div>
      </div>

      {/* Issues List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg bg-card/40">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-foreground">No Lint Issues</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Your LaTeX source passes all document structure checks, security policies, and placeholder rules.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 transition-colors ${
                issue.type === 'error'
                  ? 'bg-destructive/5 border-destructive/20'
                  : issue.type === 'warning'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-muted/30 border-border/60'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getSeverityIcon(issue.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getSeverityBadge(issue.type)}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      rule: {issue.rule}
                    </span>
                    {issue.line && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Line {issue.line}{issue.column ? `:${issue.column}` : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-foreground text-xs">{issue.message}</p>
                  {issue.codeSnippet && (
                    <code className="block font-mono text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded max-w-xl truncate">
                      {issue.codeSnippet}
                    </code>
                  )}
                </div>
              </div>

              {issue.line && onJumpToLine && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] font-mono px-2 gap-1 shrink-0"
                  onClick={() => onJumpToLine(issue.line!)}
                >
                  <FileCode className="h-3 w-3" />
                  Jump
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TemplateLintTab
