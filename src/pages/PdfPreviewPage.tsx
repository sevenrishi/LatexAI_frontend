import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  FileCode,
  Printer,
  RefreshCw,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PdfViewer } from '@/features/templates/components/PdfViewer'
import {
  useGenerationDetail,
  useRefreshPdfUrl,
} from '@/features/generate/hooks/useGenerate'
import { downloadResumeFile } from '@/features/review/utils/downloadResume'
import { toast } from 'sonner'

export function PdfPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isAutoDownload = searchParams.get('download') === 'true'
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed'>('idle')
  const autoDownloadTriggeredRef = useRef(false)

  const { data: generation, isLoading, isError, refetch } = useGenerationDetail(id)
  const refreshPdfUrlMutation = useRefreshPdfUrl()

  const gen = generation as any
  const jobTitle = gen?.jobTitle || gen?.job_title || 'Tailored Position'
  const companyName = gen?.companyName || gen?.company_name || 'Company'
  const atsOverallScore =
    gen?.atsScore?.overall ?? gen?.atsScore?.score ?? gen?.ats_score?.score ?? 0
  const pdfUrl = gen?.compiledPdfUrl || gen?.pdfUrl
  const fileName = `${jobTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}.pdf`

  // Automatic download and tab closure when opened with ?download=true
  useEffect(() => {
    if (!isAutoDownload || !id || !generation || autoDownloadTriggeredRef.current) return
    const targetPdfUrl = gen?.compiledPdfUrl || gen?.pdfUrl
    if (!targetPdfUrl) return

    autoDownloadTriggeredRef.current = true
    setDownloadStatus('downloading')

    const triggerAndClose = async () => {
      try {
        await downloadResumeFile({
          generationId: id,
          format: 'pdf',
          jobTitle,
          companyName,
          fallbackPdfUrl: targetPdfUrl,
        })
        setDownloadStatus('completed')
        // Give the download and browser time to initiate file saving before closing
        setTimeout(() => {
          try {
            window.close()
          } catch {
            // Graceful fallback if window.close is restricted
          }
        }, 1200)
      } catch (err) {
        console.error('Auto download failed:', err)
        setDownloadStatus('idle')
      }
    }

    triggerAndClose()
  }, [isAutoDownload, id, generation, gen, jobTitle, companyName])

  const handleDownloadPdf = async () => {
    if (!id || !generation) return
    try {
      await downloadResumeFile({
        generationId: id,
        format: 'pdf',
        jobTitle,
        companyName,
        fallbackPdfUrl: pdfUrl,
      })
    } catch {
      // toast is handled in downloadResumeFile
    }
  }

  const handleDownloadTex = async () => {
    if (!id || !generation) return
    try {
      await downloadResumeFile({
        generationId: id,
        format: 'tex',
        jobTitle,
        companyName,
        fallbackLatexSource: gen.latexSource || gen.latex_code,
      })
    } catch {
      // toast is handled in downloadResumeFile
    }
  }

  const handleRefreshUrl = async () => {
    if (!id) return
    try {
      await refreshPdfUrlMutation.mutateAsync(id)
      toast.success('PDF preview link refreshed successfully!')
      refetch()
    } catch {
      toast.error('Failed to refresh PDF download link')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="h-14 border-b px-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs">Loading PDF document...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !generation) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-6">
        <Card className="max-w-md w-full border-destructive/40 text-center p-8 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Resume Preview Not Found</CardTitle>
          <CardDescription className="text-sm">
            We couldn't load the resume preview for ID{' '}
            <code className="font-mono text-foreground font-semibold">{id}</code>.
          </CardDescription>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
            <Button size="sm" asChild>
              <Link to="/history">Go to History</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden" data-testid="pdf-preview-page">
      {/* Top Application Bar */}
      <header className="h-14 border-b border-border/80 px-4 bg-background/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-30 select-none">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1.5"
          >
            <Link to={`/review/${id}`}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Review</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />

          <div className="flex items-center gap-2 truncate min-w-0">
            <FileText className="h-4 w-4 text-primary shrink-0 hidden sm:block" />
            <span className="font-semibold text-sm truncate text-foreground">
              {jobTitle}
            </span>
            <span className="text-xs text-muted-foreground shrink-0 hidden md:inline">
              at {companyName}
            </span>
            {atsOverallScore > 0 && (
              <Badge
                variant={
                  atsOverallScore >= 80 ? 'success' : atsOverallScore >= 60 ? 'warning' : 'destructive'
                }
                className="text-[11px] font-mono shrink-0 hidden lg:inline-flex"
              >
                ATS: {atsOverallScore}%
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Actions (Refresh, Print, Download .tex, Download PDF) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefreshUrl}
            disabled={refreshPdfUrlMutation.isPending}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hidden sm:flex gap-1"
            title="Refresh secure preview link"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshPdfUrlMutation.isPending ? 'animate-spin' : ''}`}
            />
            <span className="hidden md:inline">Refresh Link</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex gap-1.5"
            title="Print Document"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Print</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTex}
            className="h-8 px-2.5 text-xs gap-1.5"
            title="Download LaTeX Source"
          >
            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden md:inline">LaTeX</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDownloadPdf}
            className="h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs"
            title="Download PDF File"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </header>

      {/* Auto Download Status Notification Banner */}
      {isAutoDownload && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-3 text-xs text-primary z-20">
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`h-3.5 w-3.5 ${downloadStatus === 'downloading' ? 'animate-spin' : ''}`}
            />
            <span className="font-medium">
              {downloadStatus === 'downloading'
                ? 'Downloading resume PDF...'
                : 'Download complete! Closing preview tab...'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/20"
            onClick={() => window.close()}
          >
            Close Tab
          </Button>
        </div>
      )}

      {/* Main Full-Height Viewer */}
      <main className="flex-1 min-h-0 relative">
        <PdfViewer
          file={pdfUrl}
          fileName={fileName}
          className="h-full border-none rounded-none"
          onDownload={handleDownloadPdf}
          emptyMessage="No compiled PDF document is currently available for this resume."
        />
      </main>
    </div>
  )
}

export default PdfPreviewPage

