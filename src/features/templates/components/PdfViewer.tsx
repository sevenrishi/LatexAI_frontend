import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Set up pdf.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }
}

export interface PdfViewerProps {
  file: string | File | Blob | null | undefined
  fileName?: string
  className?: string
  onDownload?: () => void
  onCompileRequest?: () => void
  isCompiling?: boolean
  emptyMessage?: string
  openInNewTabUrl?: string
  onOpenInNewTab?: () => void
}

export function PdfViewer({
  file,
  fileName = 'resume-preview.pdf',
  className = '',
  onDownload,
  onCompileRequest,
  isCompiling = false,
  emptyMessage = 'Compile LaTeX to view rendered PDF',
  openInNewTabUrl,
  onOpenInNewTab,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [_loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(600)
  const containerRef = useRef<HTMLDivElement>(null)

  // Measure container for responsive page rendering
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerWidth(Math.floor(entry.contentRect.width))
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setLoading(false)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF loading error:', err)
    setError(err.message || 'Failed to render PDF preview')
    setLoading(false)
  }, [])

  const zoomIn = () => setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)))
  const zoomOut = () => setScale((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)))
  const resetZoom = () => setScale(1.0)
  const fitWidth = () => {
    if (!containerRef.current) return
    const available = containerRef.current.clientWidth - 48
    // standard letter width is 612 pt
    const calculated = +(available / 612).toFixed(2)
    setScale(Math.max(0.5, Math.min(2.0, calculated)))
  }

  const rotate = () => setRotation((prev) => (prev + 90) % 360)

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }
    if (!file) return

    const link = document.createElement('a')
    if (typeof file === 'string') {
      link.href = file
    } else {
      link.href = URL.createObjectURL(file)
    }
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openInNewTab = () => {
    if (onOpenInNewTab) {
      onOpenInNewTab()
      return
    }
    if (openInNewTabUrl) {
      window.open(openInNewTabUrl, '_blank')
      return
    }
    if (!file) return
    const url = typeof file === 'string' ? file : URL.createObjectURL(file)
    window.open(url, '_blank')
  }

  // Render empty state if no file provided
  if (!file) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full min-h-[460px] p-8 text-center bg-muted/20 border border-dashed rounded-lg ${className}`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-1">No PDF Compiled Yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{emptyMessage}</p>
        {onCompileRequest && (
          <Button onClick={onCompileRequest} disabled={isCompiling} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
            {isCompiling ? 'Compiling LaTeX...' : 'Compile Preview'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex flex-col h-full bg-muted/30 rounded-lg border overflow-hidden ${className}`}>
        {/* PDF Viewer Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-background border-b gap-2 text-xs flex-wrap select-none">
          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-1 font-mono text-muted-foreground">
              {pageNumber} / {numPages || 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom & View Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={zoomOut}
                  disabled={scale <= 0.4}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <button
              onClick={resetZoom}
              className="px-2 py-0.5 font-mono text-[11px] rounded hover:bg-muted text-muted-foreground transition-colors"
              title="Reset Zoom to 100%"
            >
              {Math.round(scale * 100)}%
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={zoomIn}
                  disabled={scale >= 2.5}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fitWidth}>
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to Width</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={rotate}>
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate</TooltipContent>
            </Tooltip>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onCompileRequest && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1.5"
                onClick={onCompileRequest}
                disabled={isCompiling}
              >
                <RefreshCw className={`h-3 w-3 ${isCompiling ? 'animate-spin' : ''}`} />
                {isCompiling ? 'Compiling...' : 'Recompile'}
              </Button>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openInNewTab}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in New Tab</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* PDF Canvas Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 flex justify-center items-start min-h-[480px] bg-neutral-900/5 dark:bg-neutral-950/40"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md my-auto">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <h4 className="font-medium text-destructive mb-1">Failed to Render PDF</h4>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              {onCompileRequest && (
                <Button variant="outline" size="sm" onClick={onCompileRequest} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Compiling Again
                </Button>
              )}
            </div>
          ) : (
            <div className="relative shadow-2xl rounded-sm transition-transform duration-150">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex flex-col items-center justify-center p-16 gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary opacity-70" />
                    <span className="text-xs text-muted-foreground">Rendering document pages...</span>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  width={containerWidth ? Math.min(containerWidth - 32, 612 * scale) : undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white rounded-sm"
                />
              </Document>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PdfViewer
