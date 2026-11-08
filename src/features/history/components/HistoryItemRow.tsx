import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink,
  RotateCcw,
  Download,
  Trash2,
  FileCode,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { downloadResumeFile } from '@/features/review/utils/downloadResume'
import type { ResumeHistoryItem } from '../types'

export interface HistoryItemRowProps {
  item: ResumeHistoryItem
  onDelete: (id: string) => Promise<void>
  onRetry?: (id: string) => Promise<void>
  className?: string
}

export function HistoryItemRow({
  item,
  onDelete,
  onRetry,
  className = '',
}: HistoryItemRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const isCompleted = item.status === 'COMPLETED'
  const isFailed = item.status === 'FAILED'
  const isInProgress = ['QUEUED', 'ANALYZING', 'TAILORING', 'RENDERING', 'COMPILING'].includes(
    item.status
  )

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const atsScore = item.atsScore ?? 0

  const handleDownload = async (format: 'pdf' | 'tex') => {
    setIsDownloading(true)
    try {
      await downloadResumeFile({
        generationId: item.id,
        format,
        jobTitle: item.jobTitle,
        companyName: item.companyName,
        fallbackPdfUrl: item.compiledPdfUrl,
        fallbackLatexSource: item.latexSource,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(item.id)
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRetryClick = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry(item.id)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <>
      <Card
        className={`border-border/70 hover:border-border transition-all duration-200 shadow-xs ${className}`}
        data-testid={`history-item-${item.id}`}
      >
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Role Info & Metadata */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">
                {item.jobTitle}
              </h3>
              {item.templateName && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-muted/40 text-muted-foreground border-border/80"
                >
                  {item.templateName}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium text-foreground/90">{item.companyName}</span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">ID: {item.id}</span>
            </div>
          </div>

          {/* Middle: Status & ATS Score */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Status indicator */}
            {isCompleted && (
              <Badge variant="success" className="text-xs gap-1 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Ready
              </Badge>
            )}
            {isFailed && (
              <Badge variant="destructive" className="text-xs gap-1 font-semibold">
                <AlertCircle className="h-3 w-3" /> Failed
              </Badge>
            )}
            {isInProgress && (
              <Badge variant="warning" className="text-xs gap-1 font-semibold animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" /> In Progress
              </Badge>
            )}

            {/* ATS Score Gauge Badge */}
            {isCompleted && atsScore > 0 && (
              <Badge
                variant={atsScore >= 80 ? 'success' : atsScore >= 60 ? 'warning' : 'destructive'}
                className="text-xs font-mono font-bold"
                data-testid={`history-score-${item.id}`}
              >
                {atsScore}% ATS
              </Badge>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5 self-end md:self-center flex-wrap">
            {/* View Review Link */}
            {isCompleted && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 text-xs gap-1.5 font-medium shadow-xs"
                data-testid={`view-review-${item.id}`}
              >
                <Link to={`/review/${item.id}`}>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Review</span>
                </Link>
              </Button>
            )}

            {/* Reuse JD Link */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs gap-1.5 font-medium shadow-xs"
              data-testid={`reuse-jd-${item.id}`}
            >
              <Link to={`/generate?from=${item.id}`}>
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Reuse</span>
              </Link>
            </Button>

            {/* Retry Button if Failed */}
            {isFailed && onRetry && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRetryClick}
                disabled={isRetrying}
                className="h-8 text-xs gap-1.5"
                data-testid={`retry-generation-${item.id}`}
              >
                {isRetrying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                <span>Retry</span>
              </Button>
            )}

            {/* Download Dropdown */}
            {isCompleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDownloading}
                    className="h-8 px-2 text-xs gap-1"
                    data-testid={`download-trigger-${item.id}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDownload('pdf')}
                    className="text-xs gap-2 cursor-pointer"
                    data-testid={`download-pdf-${item.id}`}
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Download PDF (.pdf)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownload('tex')}
                    className="text-xs gap-2 cursor-pointer"
                    data-testid={`download-tex-${item.id}`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Download LaTeX (.tex)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Row Actions Menu / Delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  data-testid={`row-menu-${item.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="text-xs gap-2 cursor-pointer">
                  <Link to={`/review/${item.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Inspect Review Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs gap-2 cursor-pointer">
                  <Link to={`/generate?from=${item.id}`}>
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Pre-fill New Application</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                  data-testid={`delete-trigger-${item.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Resume</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Generated Resume?"
        description={`Are you sure you want to delete the tailored resume for "${item.jobTitle}" at "${item.companyName}"? This will permanently purge the compiled PDF and LaTeX files.`}
        variant="destructive"
        confirmText={isDeleting ? 'Deleting...' : 'Delete Resume'}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default HistoryItemRow
