import { useState, useCallback, useEffect } from 'react'
import {
  Download,
  RefreshCw,
  AlertTriangle,
  FileCode,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PdfViewer } from '@/features/templates/components/PdfViewer'
import { toast } from 'sonner'

export interface ReviewPdfPanelProps {
  pdfUrl?: string | null
  pdfUrlExpiresAt?: string
  isOutOfDate?: boolean
  isRerendering?: boolean
  isRefreshingUrl?: boolean
  fileName?: string
  generationId?: string
  onDownload?: () => void
  onRerender?: () => void | Promise<void>
  onRefreshPdfUrl?: () => void | Promise<void>
  className?: string
}

export function ReviewPdfPanel({
  pdfUrl,
  pdfUrlExpiresAt,
  isOutOfDate = false,
  isRerendering = false,
  isRefreshingUrl = false,
  fileName = 'tailored-resume.pdf',
  generationId: _generationId,
  onDownload,
  onRerender,
  onRefreshPdfUrl,
  className = '',
}: ReviewPdfPanelProps) {
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false)

  // Handle URL expiration detection & manual/auto refetch (FE-5.02)
  const isUrlExpired = useCallback(() => {
    if (!pdfUrlExpiresAt) return false
    try {
      return new Date(pdfUrlExpiresAt).getTime() <= Date.now()
    } catch {
      return false
    }
  }, [pdfUrlExpiresAt])

  const handleRefreshUrl = async () => {
    if (!onRefreshPdfUrl) return
    try {
      await onRefreshPdfUrl()
      toast.success('PDF preview link refreshed successfully!')
    } catch {
      toast.error('Failed to refresh PDF download link')
    }
  }

  // Auto-refresh when URL is expired or when PDF load fails with possible auth/403
  useEffect(() => {
    if (isUrlExpired() && onRefreshPdfUrl && !hasAutoRefreshed && !isRefreshingUrl) {
      setHasAutoRefreshed(true)
      onRefreshPdfUrl()
    }
  }, [isUrlExpired, onRefreshPdfUrl, hasAutoRefreshed, isRefreshingUrl])

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={`flex flex-col h-full overflow-hidden border-border/70 shadow-xs relative ${className}`}
        data-testid="review-pdf-panel"
      >
        {/* Header Toolbar */}
        <CardHeader className="p-3 bg-background border-b flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-primary" />
              <span>Compiled PDF Document</span>
            </CardTitle>
            {isOutOfDate ? (
              <Badge
                variant="outline"
                className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 animate-pulse"
                data-testid="out-of-date-badge"
              >
                <AlertTriangle className="h-3 w-3" />
                Edits Pending Re-render
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
              >
                Up to date
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Refresh signed URL trigger (FE-5.02) */}
            {onRefreshPdfUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshUrl}
                    disabled={isRefreshingUrl}
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    data-testid="refresh-pdf-url-button"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshingUrl ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh Link</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Refresh short-lived secure download signature if preview expired
                </TooltipContent>
              </Tooltip>
            )}

            {/* Re-render trigger button */}
            {isOutOfDate && onRerender && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onRerender}
                disabled={isRerendering}
                className="h-7 px-2.5 text-xs gap-1.5 shadow-xs font-semibold animate-pulse"
                data-testid="rerender-button"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRerendering ? 'animate-spin' : ''}`} />
                {isRerendering ? 'Re-compiling...' : 'Re-render PDF'}
              </Button>
            )}

            {/* Download PDF button */}
            {onDownload && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="h-7 px-2.5 text-xs gap-1 text-foreground"
                data-testid="download-pdf-button"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Content Area with Out-of-Date Overlay (FE-5.02) */}
        <CardContent className="p-0 flex-1 relative min-h-[580px] flex flex-col bg-muted/20">
          {/* Out of Date Floating Warning Banner */}
          {isOutOfDate && (
            <div
              className="absolute top-3 left-3 right-3 z-20 p-3 rounded-lg bg-amber-500/90 text-amber-950 backdrop-blur-md shadow-md border border-amber-600/30 flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200"
              data-testid="out-of-date-overlay"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 font-bold" />
                <span>
                  <strong>Preview may be out of date.</strong> Resume content was updated.
                  Re-render to refresh the compiled PDF document.
                </span>
              </div>
              {onRerender && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={onRerender}
                  disabled={isRerendering}
                  className="h-7 px-2.5 text-xs font-semibold shrink-0 gap-1 bg-white hover:bg-amber-100 text-amber-950"
                  data-testid="overlay-rerender-button"
                >
                  <RefreshCw className={`h-3 w-3 ${isRerendering ? 'animate-spin' : ''}`} />
                  {isRerendering ? 'Compiling...' : 'Re-render'}
                </Button>
              )}
            </div>
          )}

          {/* Embedded PDF Viewer */}
          <div className="flex-1 w-full h-full relative">
            <PdfViewer
              file={pdfUrl}
              fileName={fileName}
              className="h-full border-none rounded-none"
              onDownload={onDownload}
              onCompileRequest={onRerender}
              isCompiling={isRerendering}
              emptyMessage="No compiled PDF available for this resume generation. Click Re-render to generate one."
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default ReviewPdfPanel
