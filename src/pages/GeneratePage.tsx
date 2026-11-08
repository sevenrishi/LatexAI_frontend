import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Globe, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGenerationUsage,
  usePreviousGeneration,
  useFetchJobUrl,
  useCreateGeneration,
  ApiError,
} from '@/features/generate/hooks/useGenerate'
import { UsageCounters } from '@/features/generate/components/UsageCounters'
import { ActionableErrorCard } from '@/features/generate/components/ActionableErrorCard'
import { ReuseJobBanner } from '@/features/generate/components/ReuseJobBanner'
import { ActiveTemplateSelector } from '@/features/generate/components/ActiveTemplateSelector'
import { JobUrlTab } from '@/features/generate/components/JobUrlTab'
import { JobPasteTab } from '@/features/generate/components/JobPasteTab'
import type { JobFetchResponse } from '@/types/generation'

export function GeneratePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const fromId = searchParams.get('from') || searchParams.get('reuse')

  // UI state
  const [tab, setTab] = useState<'paste' | 'url'>('paste')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobText, setJobText] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [extractedData, setExtractedData] = useState<JobFetchResponse | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [errorState, setErrorState] = useState<{
    code?: string
    message?: string
  } | null>(null)

  // API hooks
  const { data: usage, isLoading: isLoadingUsage } = useGenerationUsage()
  const { data: previousGen, isLoading: _isLoadingPrevious } = usePreviousGeneration(fromId)
  const fetchJobMutation = useFetchJobUrl()
  const createGenMutation = useCreateGeneration()

  // Pre-fill inputs when reusing a previous generation (FE-4.04)
  useEffect(() => {
    if (previousGen) {
      if (previousGen.jobTitle) setJobTitle(previousGen.jobTitle)
      if (previousGen.companyName) setCompanyName(previousGen.companyName)
      if (previousGen.jobText) {
        setJobText(previousGen.jobText)
        setTab('paste')
      } else if (previousGen.jobUrl) {
        setJobUrl(previousGen.jobUrl)
        setTab('url')
      }
      if (previousGen.templateId) setSelectedTemplateId(previousGen.templateId)
      toast.info(`Pre-filled job details from resume ${previousGen.id}`)
    }
  }, [previousGen])

  const handleClearReused = () => {
    setSearchParams({})
    setJobTitle('')
    setCompanyName('')
    setJobText('')
    setJobUrl('')
    setExtractedData(null)
    setErrorState(null)
    toast.info('Cleared reused job details')
  }

  // Handle URL Extraction (FE-4.02)
  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) return
    setErrorState(null)

    try {
      const data = await fetchJobMutation.mutateAsync({ url: jobUrl.trim() })
      setExtractedData(data)
      if (data.jobTitle && !jobTitle) setJobTitle(data.jobTitle)
      if (data.companyName && !companyName) setCompanyName(data.companyName)
      if (data.jobText) setJobText(data.jobText)
      toast.success('Job details extracted successfully!')
    } catch (err: unknown) {
      let code = 'URL_FETCH_FAILED'
      let message = 'Could not retrieve job description from the provided link.'

      if (err instanceof ApiError) {
        code = err.code
        message = err.friendlyMessage || err.message
      } else if (err instanceof Error) {
        message = err.message
      }

      // Automated fallback to "Paste text" tab upon bot-blocking or fetch failure (FE-4.02)
      if (code === 'URL_BLOCKED' || code === 'URL_FETCH_FAILED') {
        setTab('paste')
        setErrorState({
          code,
          message:
            code === 'URL_BLOCKED'
              ? 'Unable to fetch this job URL due to website bot protection. We have switched you to the "Paste text" tab — please paste the job description directly.'
              : 'Could not extract job text from this URL. We have switched you to the "Paste text" tab — please paste the job description directly.',
        })
        toast.warning('Switched to Paste Text tab due to website restrictions.')
      } else {
        setErrorState({ code, message })
        toast.error(message)
      }
    }
  }

  const handleUseExtracted = (data: JobFetchResponse) => {
    if (data.jobTitle) setJobTitle(data.jobTitle)
    if (data.companyName) setCompanyName(data.companyName)
    if (data.jobText) setJobText(data.jobText)
    setTab('paste')
    toast.success('Applied extracted job text to editor')
  }

  // Handle Clipboard Paste
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setJobText(text)
        toast.success('Pasted from clipboard')
      }
    } catch {
      toast.error('Unable to read clipboard. Please paste manually.')
    }
  }

  // Handle Sample Insertion
  const handleInsertSample = () => {
    setJobTitle('Staff Infrastructure Engineer')
    setCompanyName('Stripe')
    setJobText(
      `Stripe is looking for a Staff Infrastructure Engineer to design, scale, and maintain our global distributed payment processing platforms and data storage layers.\n\nKey Responsibilities:\n- Lead the architectural evolution of our multi-region Kubernetes clusters and high-throughput messaging infrastructure.\n- Improve p99.9 latency, resilience, and fault isolation across tier-1 distributed services.\n- Partner with product teams to design robust API contracts and database schemas handling billions in transactional volume.\n- Mentor senior engineers and drive infrastructure reliability best practices.\n\nQualifications:\n- 8+ years of production experience in distributed systems, high-concurrency architectures, and cloud infrastructure.\n- Deep expertise with Go, TypeScript, Rust, or Java in production environments.\n- Extensive experience with Kubernetes, Kafka, Redis, PostgreSQL, and Linux kernel networking.\n- Track record of driving large-scale migrations with zero downtime.`
    )
    toast.success('Inserted sample Staff Engineer job description')
  }

  // Handle Generation Submission (FE-4.03)
  const handleGenerate = async () => {
    setErrorState(null)

    // Determine target job text
    let targetText = jobText.trim()
    if (tab === 'url' && extractedData?.jobText) {
      targetText = extractedData.jobText.trim()
    }

    if (!targetText || targetText.length < 20) {
      toast.error('Please enter a job description of at least 20 characters before tailoring.')
      return
    }

    try {
      const res = await createGenMutation.mutateAsync({
        jobDescription: targetText,
        jobText: targetText,
        jobTitle: jobTitle.trim() || undefined,
        companyName: companyName.trim() || undefined,
        jobUrl: tab === 'url' ? jobUrl.trim() : undefined,
        templateId: selectedTemplateId,
        sourceGenerationId: fromId || undefined,
      })

      toast.success('Job analyzed successfully! Tailoring your LaTeX resume...')
      navigate(`/generate/${res.id}`)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorState({
          code: err.code,
          message: err.friendlyMessage || err.message,
        })

        if (err.code === 'PROFILE_INCOMPLETE') {
          toast.error('Your career profile is incomplete. Please add your experience and skills.')
        } else if (err.code === 'QUOTA_EXCEEDED') {
          toast.error('Daily generation quota reached. Quota resets at midnight UTC.')
        } else if (err.code === 'RATE_LIMITED') {
          toast.error('Rate limit reached. Please wait a moment before trying again.')
        } else {
          toast.error(err.friendlyMessage || err.message)
        }
      } else if (err instanceof Error) {
        setErrorState({ code: 'ERROR', message: err.message })
        toast.error(err.message)
      } else {
        setErrorState({
          code: 'UNKNOWN',
          message: 'An unexpected error occurred. Please try again.',
        })
      }
    }
  }

  const isSubmitting = createGenMutation.isPending
  const isReadyToSubmit =
    tab === 'paste'
      ? jobText.trim().length >= 20
      : Boolean(extractedData?.jobText || jobText.trim().length >= 20)

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      {/* Page Header with Usage Counters (FE-4.01) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Tailor Resume to Job
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Extract keywords, align verified facts, and generate a compilation-ready LaTeX resume.
          </p>
        </div>

        <UsageCounters usage={usage} isLoading={isLoadingUsage} />
      </div>

      {/* Reused Job Banner (FE-4.04) */}
      {fromId && (
        <ReuseJobBanner
          generation={previousGen}
          fromId={fromId}
          onClear={handleClearReused}
        />
      )}

      {/* Target LaTeX Template Indicator */}
      <ActiveTemplateSelector
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
      />

      {/* Actionable Error Alert (FE-4.03, FE-4.02) */}
      {errorState && (
        <ActionableErrorCard
          code={errorState.code}
          message={errorState.message}
          onRetry={errorState.code === 'RATE_LIMITED' ? handleGenerate : undefined}
          onDismiss={() => setErrorState(null)}
        />
      )}

      {/* Main Input Card with Segmented Control (FE-4.01) */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold">Target Job Description</CardTitle>
              <CardDescription className="text-xs">
                Provide the job requirements via raw text or job board URL
              </CardDescription>
            </div>

            {/* Segmented Control */}
            <Tabs
              value={tab}
              onValueChange={(val) => {
                setTab(val as 'paste' | 'url')
                setErrorState(null)
              }}
            >
              <TabsList className="grid grid-cols-2 w-full sm:w-60 h-9 p-1 bg-muted/70">
                <TabsTrigger value="paste" className="gap-1.5 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-1.5 text-xs font-semibold">
                  <Globe className="h-3.5 w-3.5" />
                  Job URL
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {tab === 'paste' ? (
            <JobPasteTab
              jobTitle={jobTitle}
              onChangeJobTitle={setJobTitle}
              companyName={companyName}
              onChangeCompanyName={setCompanyName}
              jobText={jobText}
              onChangeJobText={setJobText}
              onPasteClipboard={handlePasteClipboard}
              onInsertSample={handleInsertSample}
            />
          ) : (
            <JobUrlTab
              jobUrl={jobUrl}
              onChangeUrl={setJobUrl}
              onFetch={handleFetchUrl}
              isFetching={fetchJobMutation.isPending}
              extractedData={extractedData}
              onUseExtracted={handleUseExtracted}
              onClearExtracted={() => setExtractedData(null)}
            />
          )}

          {/* Submission Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/70">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              {tab === 'url' && !extractedData && !jobText ? (
                <span>Extract job details above or switch to Paste Text tab to begin</span>
              ) : (
                <span>Strict ATS keyword alignment with zero hallucinated claims</span>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!isReadyToSubmit || isSubmitting}
              className="w-full sm:w-auto gap-2 shadow-sm font-semibold h-10 px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing &amp; Tailoring Resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze &amp; Tailor LaTeX Resume
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeneratePage
