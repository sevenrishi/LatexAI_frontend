import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  FileCode,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Layers,
  Edit3,
  ExternalLink,
} from 'lucide-react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGenerationDetail,
  useRerenderGeneration,
  useRefreshPdfUrl,
} from '@/features/generate/hooks/useGenerate'
import { AtsScoreTab } from '@/features/review/components/AtsScoreTab'
import { ReviewPdfPanel } from '@/features/review/components/ReviewPdfPanel'
import { ChangesTab } from '@/features/review/components/ChangesTab'
import { EditTab } from '@/features/review/components/EditTab'
import { downloadResumeFile } from '@/features/review/utils/downloadResume'

export function ReviewPage() {
  const { id } = useParams<{ id: string }>()

  // Active tab state in left panel
  const [activeTab, setActiveTab] = useState<'ats' | 'changes' | 'edit'>('ats')

  // Mobile layout view selector ('details' vs 'pdf')
  const [mobileView, setMobileView] = useState<'details' | 'pdf'>('details')

  // Local out-of-date state (triggered by edits or simulated edits)
  const [isOutOfDate, setIsOutOfDate] = useState(false)

  // Data fetching hook for generation details (FE-5.01)
  const { data: generation, isLoading, isError, refetch } = useGenerationDetail(id)

  // Mutations for re-rendering and refreshing PDF signed URL (FE-5.02)
  const rerenderMutation = useRerenderGeneration()
  const refreshPdfUrlMutation = useRefreshPdfUrl()

  const handleRerender = async () => {
    if (!id) return
    try {
      await rerenderMutation.mutateAsync(id)
      setIsOutOfDate(false)
      toast.success('Resume re-rendered and compiled successfully!')
    } catch {
      toast.error('Failed to re-render resume')
    }
  }

  const handleRefreshPdfUrl = async () => {
    if (!id) return
    try {
      await refreshPdfUrlMutation.mutateAsync(id)
    } catch {
      toast.error('Failed to refresh download signature')
    }
  }

  // Handle PDF download via auto-closing preview tab (FE-5.06)
  const handleDownloadPdf = async () => {
    if (!id || !generation) return
    const gen = generation as any
    const previewTab = window.open(`/preview/${id}?download=true`, '_blank')
    if (!previewTab) {
      // Fallback to direct download in case popup blocker intercepts new tab
      try {
        await downloadResumeFile({
          generationId: id,
          format: 'pdf',
          jobTitle: gen.jobTitle || gen.job_title,
          companyName: gen.companyName || gen.company_name,
          fallbackPdfUrl: gen.compiledPdfUrl || gen.pdfUrl,
        })
      } catch {
        // toast is handled in downloadResumeFile
      }
    }
  }

  // Handle LaTeX .tex source download (FE-5.06)
  const handleDownloadTex = async () => {
    if (!id || !generation) return
    const gen = generation as any
    try {
      await downloadResumeFile({
        generationId: id,
        format: 'tex',
        jobTitle: gen.jobTitle || gen.job_title,
        companyName: gen.companyName || gen.company_name,
        fallbackLatexSource: gen.latexSource || gen.latex_code,
      })
    } catch {
      // toast is handled in downloadResumeFile
    }
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto" data-testid="review-loading-skeleton">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !generation) {
    return (
      <div className="max-w-2xl mx-auto py-12" data-testid="review-error-state">
        <Card className="border-destructive/40 text-center p-8 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Resume Review Not Found</CardTitle>
          <CardDescription className="text-sm">
            We couldn't load the resume generation details for ID{' '}
            <code className="font-mono text-foreground font-semibold">{id}</code>. It may have expired or
            been removed.
          </CardDescription>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
            <Button size="sm" asChild>
              <Link to="/generate">Back to Generator</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const gen = generation as any
  const jobTitle = gen.jobTitle || gen.job_title || 'Target Position'
  const companyName = gen.companyName || gen.company_name || 'Target Company'
  const templateName = gen.templateName || (gen.template_id === 'tpl_minimal_tech' ? 'Minimal Tech' : 'ATS Single Column')
  const atsOverallScore = gen.atsScore?.overall ?? gen.atsScore?.score ?? gen.ats_score?.score ?? 0
  const pdfUrl = gen.compiledPdfUrl || gen.pdfUrl
  const pdfUrlExpiresAt = gen.pdfUrlExpiresAt

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300" data-testid="review-page">
      {/* Top Header & Action Controls (FE-5.01) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1.5">
          {/* Breadcrumb & ID chip */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link to="/generate">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Generator
              </Link>
            </Button>
            <span className="text-muted-foreground text-xs">•</span>
            <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
              ID: {generation.id}
            </Badge>
            <Badge
              variant="outline"
              className="text-[11px] bg-muted/40 text-muted-foreground border-border/80"
            >
              Template: {templateName}
            </Badge>
          </div>

          {/* Title & Status Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Resume Review
            </h1>
            <Badge variant="success" className="text-xs gap-1 font-semibold" data-testid="status-chip">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Compiled Successfully
            </Badge>

            {/* Score Badge */}
            <Badge
              variant={atsOverallScore >= 80 ? 'success' : atsOverallScore >= 60 ? 'warning' : 'destructive'}
              className="text-xs font-mono font-bold"
              data-testid="header-score-badge"
            >
              ATS Score: {atsOverallScore}%
            </Badge>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground">
            Tailored for <strong className="text-foreground">{jobTitle}</strong> at{' '}
            <strong className="text-foreground">{companyName}</strong>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          {/* Reuse JD action */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Link to={`/generate?from=${generation.id}`}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reuse JD</span>
            </Link>
          </Button>

          {/* Open Preview in New Tab */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/preview/${generation.id}`, '_blank')}
            className="text-xs gap-1.5 shadow-xs"
            data-testid="header-open-pdf-tab"
            title="Open PDF preview in a new tab"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Open in Tab</span>
          </Button>

          {/* Download LaTeX .tex */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTex}
            className="text-xs gap-1.5 shadow-xs"
            data-testid="header-download-tex"
          >
            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Download .tex</span>
          </Button>

          {/* Download PDF */}
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPdf}
            className="text-xs gap-1.5 shadow-xs font-semibold"
            data-testid="header-download-pdf"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Mobile View Toggle Switcher (Visible on mobile/small screens) */}
      <div className="flex lg:hidden w-full bg-muted p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setMobileView('details')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mobileView === 'details'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ATS &amp; Review Details
        </button>
        <button
          type="button"
          onClick={() => setMobileView('pdf')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mobileView === 'pdf'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          PDF Document Preview
        </button>
      </div>

      {/* Dual-Panel View Layout (FE-5.01) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel (5 columns on LG): Tabbed Controls (ATS Score / AI Changes / Manual Edit) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileView === 'pdf' ? 'hidden lg:block' : 'block'
          }`}
          data-testid="left-review-panel"
        >
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'ats' | 'changes' | 'edit')}
            className="w-full"
          >
            {/* Tab navigation bar */}
            <TabsList className="grid grid-cols-3 w-full h-10 p-1 mb-4 bg-muted/60">
              <TabsTrigger
                value="ats"
                className="text-xs gap-1.5 font-medium data-[state=active]:font-semibold"
                data-testid="tab-trigger-ats"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>ATS Score</span>
              </TabsTrigger>
              <TabsTrigger
                value="changes"
                className="text-xs gap-1.5 font-medium data-[state=active]:font-semibold"
                data-testid="tab-trigger-changes"
              >
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span>AI Changes</span>
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="text-xs gap-1.5 font-medium data-[state=active]:font-semibold"
                data-testid="tab-trigger-edit"
              >
                <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Manual Edit</span>
              </TabsTrigger>
            </TabsList>

            {/* ATS Score Tab Content (FE-5.03) */}
            <TabsContent value="ats" className="mt-0">
              <AtsScoreTab
                scoreData={gen.atsScore || gen.ats_score}
                onSkillAdded={(_skill) => {
                  // After adding skill to profile, prompt or indicate re-score opportunity
                  toast.info('Skill saved to profile! It will be prioritized in your next generation.')
                }}
              />
            </TabsContent>

            {/* AI Changes Tab Content (FE-5.04) */}
            <TabsContent value="changes" className="mt-0">
              <ChangesTab changesData={gen.changes || gen.change_summary} />
            </TabsContent>

            {/* Manual Edit Tab Content (FE-5.05) */}
            <TabsContent value="edit" className="mt-0">
              <EditTab
                generationId={gen.id}
                initialContent={gen.tailoredContent || gen.tailored_content}
                isOutOfDate={isOutOfDate || gen.isOutOfDate}
                onSavedAndRerender={() => {
                  setIsOutOfDate(false)
                  refetch()
                }}
                onMarkEdited={() => {
                  setIsOutOfDate(true)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel (7 columns on LG): Embedded PDF Preview Panel (FE-5.02) */}
        <div
          className={`lg:col-span-7 sticky top-4 ${
            mobileView === 'details' ? 'hidden lg:block' : 'block'
          }`}
          data-testid="right-pdf-panel"
        >
          <ReviewPdfPanel
            pdfUrl={pdfUrl}
            pdfUrlExpiresAt={pdfUrlExpiresAt}
            isOutOfDate={isOutOfDate || gen.isOutOfDate}
            isRerendering={rerenderMutation.isPending}
            isRefreshingUrl={refreshPdfUrlMutation.isPending}
            generationId={gen.id}
            fileName={`${jobTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'resume'}.pdf`}
            onDownload={handleDownloadPdf}
            onRerender={handleRerender}
            onRefreshPdfUrl={handleRefreshPdfUrl}
          />
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
