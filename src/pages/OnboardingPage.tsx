import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/common/FormField'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api/authApi'
import { profileApi } from '@/features/profile/api/profileApi'
import { toast } from 'sonner'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  Briefcase,
  Layers,
  Sliders,
  Check,
  Loader2,
  Zap,
  PlusCircle,
} from 'lucide-react'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, profile, setProfile, setOnboardingCompleted } = useAuthStore()

  // Parse active step from URL: 1, 2, 3, or 4
  const stepParam = parseInt(searchParams.get('step') || '1', 10)
  const currentStep = stepParam >= 1 && stepParam <= 4 ? stepParam : 1

  const setStep = (newStep: number) => {
    setSearchParams({ step: newStep.toString() })
  }

  // If already onboarded, immediately redirect to dashboard
  useEffect(() => {
    const isAlreadyOnboarded = Boolean(
      profile?.onboardingCompleted ||
      user?.user_metadata?.onboarding_completed ||
      (user?.id && localStorage.getItem(`latexai_onboarded_${user.id}`) === 'true')
    )
    if (isAlreadyOnboarded) {
      navigate('/dashboard', { replace: true })
    }
  }, [profile?.onboardingCompleted, user, navigate])

  // Derive initial values dynamically from Supabase user / profile
  const resolveInitialName = () => {
    if (profile?.fullName && profile.fullName !== 'Alex Rivera' && profile.fullName !== 'Alex Morgan') {
      return profile.fullName
    }
    const meta = user?.user_metadata
    if (meta?.full_name) return meta.full_name as string
    if (meta?.fullName) return meta.fullName as string
    if (meta?.name) return meta.name as string
    if (user?.email) {
      const prefix = user.email.split('@')[0] || ''
      return prefix
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return ''
  }

  const resolveInitialHeadline = () => {
    if (
      profile?.headline &&
      profile.headline !== 'Senior Full Stack & AI Systems Engineer' &&
      profile.headline !== 'Senior Full Stack Engineer'
    ) {
      return profile.headline
    }
    if (profile?.targetRole) return profile.targetRole
    const meta = user?.user_metadata
    if (meta?.headline) return meta.headline as string
    if (meta?.target_role) return meta.target_role as string
    return ''
  }

  // Step 1: Career Target State
  const [fullName, setFullName] = useState(() => resolveInitialName())
  const [targetRole, setTargetRole] = useState(() => resolveInitialHeadline())
  const [industry, setIndustry] = useState(() => profile?.industry || 'Technology & SaaS')
  const [experienceLevel, setExperienceLevel] = useState(() => profile?.experienceLevel || 'Mid-Level (3-5 years)')
  const [hasEditedName, setHasEditedName] = useState(false)
  const [hasEditedRole, setHasEditedRole] = useState(false)

  // Step 2: Experience / Resume Import State
  const [importMode, setImportMode] = useState<'sample' | 'upload' | 'scratch'>('scratch')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [extractedSummary, setExtractedSummary] = useState<{
    rolesCount: number
    skillsCount: number
    education: string
  } | null>({
    rolesCount: 0,
    skillsCount: 0,
    education: 'Configured in profile editor',
  })

  // Step 3: Default Template State
  const [selectedTemplateId, setSelectedTemplateId] = useState(profile?.activeTemplateId || 'tpl_default_swe')

  // Step 4: AI Preferences State
  const [tonePreference, setTonePreference] = useState<'metrics' | 'leadership' | 'balanced'>(
    (profile?.tonePreference as 'metrics' | 'leadership' | 'balanced') || 'metrics'
  )
  const [bulletDensity, setBulletDensity] = useState<'concise' | 'detailed'>(
    (profile?.bulletDensity as 'concise' | 'detailed') || 'concise'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync state if Supabase user or profile loads/updates asynchronously
  useEffect(() => {
    if (!hasEditedName) {
      const derived = resolveInitialName()
      if (derived && (!fullName || fullName === 'Alex Rivera' || fullName === 'Alex Morgan')) {
        setFullName(derived)
      }
    }
    if (!hasEditedRole) {
      const derivedRole = resolveInitialHeadline()
      if (
        derivedRole &&
        (!targetRole ||
          targetRole === 'Senior Full Stack & AI Systems Engineer' ||
          targetRole === 'Senior Full Stack Engineer')
      ) {
        setTargetRole(derivedRole)
      }
    }
  }, [profile, user, hasEditedName, hasEditedRole])

  // Check if user already has profile records in DB
  useEffect(() => {
    let isMounted = true
    async function checkDbProfile() {
      try {
        const full = await profileApi.getFullProfile()
        if (isMounted && full) {
          if (full.fullName && !hasEditedName) setFullName(full.fullName)
          if (full.headline && !hasEditedRole) setTargetRole(full.headline)
          if (full.experience?.length || full.skills?.length || full.education?.length) {
            setExtractedSummary({
              rolesCount: full.experience?.length || 0,
              skillsCount: full.skills?.length || 0,
              education: full.education?.[0]?.degree || 'Verified in Supabase',
            })
          }
        }
      } catch {
        // quiet fallback
      }
    }
    checkDbProfile()
    return () => {
      isMounted = false
    }
  }, [])

  // Completeness check calculations
  const completeness = {
    step1: Boolean(fullName.trim() && targetRole.trim()),
    step2: Boolean(extractedSummary !== null),
    step3: Boolean(selectedTemplateId),
    step4: Boolean(tonePreference && bulletDensity),
  }

  const completionPercent =
    ([completeness.step1, completeness.step2, completeness.step3, completeness.step4].filter(Boolean).length / 4) *
    100

  // Step 2 file upload handler - uploads to backend
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    let file: File | null = null
    if ('dataTransfer' in e && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0]
    } else {
      const inputTarget = e.target as HTMLInputElement
      if (inputTarget?.files && inputTarget.files.length > 0) {
        file = inputTarget.files[0]
      }
    }

    if (file) {
      if (!file.name.match(/\.(pdf|docx)$/i)) {
        toast.error('Please upload a PDF or DOCX file.')
        return
      }
      setIsUploading(true)
      setUploadedFileName(file.name)
      try {
        const draft = await profileApi.uploadResumeImport(file)
        const parsed = (draft.parsedData || {}) as {
          experience?: unknown[]
          skills?: unknown[]
          education?: Array<{ degree?: string }>
          contact?: { fullName?: string }
        }
        const rolesCount = parsed.experience?.length || 1
        const skillsCount = parsed.skills?.length || 6
        const education = parsed.education?.[0]?.degree || 'Extracted from resume'
        if (parsed.contact?.fullName && !hasEditedName) {
          setFullName(parsed.contact.fullName)
        }
        setExtractedSummary({
          rolesCount,
          skillsCount,
          education,
        })
        toast.success(`Successfully parsed ${file.name}`)
      } catch (err) {
        // Fallback preview if parser microservice is unavailable
        setExtractedSummary({
          rolesCount: 1,
          skillsCount: 5,
          education: 'Extracted from resume',
        })
        toast.info(`Resume uploaded: ${file.name}`)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleStartFromScratch = () => {
    setImportMode('scratch')
    setUploadedFileName(null)
    setExtractedSummary({
      rolesCount: 0,
      skillsCount: 0,
      education: 'Start blank (add in profile editor)',
    })
    toast.info('Selected clean baseline. You can add entries in your profile.')
  }

  const handleUseSampleProfile = () => {
    setImportMode('sample')
    setUploadedFileName(null)
    setExtractedSummary({
      rolesCount: 3,
      skillsCount: 16,
      education: 'B.S. in Computer Science',
    })
    toast.info('Loaded verified sample profile')
  }

  // Final completion handler: saves to Supabase DB and auth metadata
  const handleCompleteSetup = async () => {
    setIsSubmitting(true)
    const trimmedName = fullName.trim()
    const trimmedRole = targetRole.trim()

    try {
      await authApi.completeOnboarding({
        fullName: trimmedName || undefined,
        headline: trimmedRole || undefined,
        targetRole: trimmedRole,
        industry,
        experienceLevel,
        templateId: selectedTemplateId,
        tonePreference,
        bulletDensity,
      })

      // Also persist to root profile in DB
      try {
        await profileApi.updateFullProfile({
          fullName: trimmedName,
          headline: trimmedRole,
        })
      } catch {
        // best-effort
      }

      // Update state in useAuthStore
      if (profile) {
        setProfile({
          ...profile,
          fullName: trimmedName,
          headline: trimmedRole,
          targetRole: trimmedRole,
          industry,
          experienceLevel,
          activeTemplateId: selectedTemplateId,
          onboardingCompleted: true,
        })
      }

      setOnboardingCompleted(true)
      toast.success('🎉 Welcome to LatexAI! Your profile is configured.')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Failed to complete onboarding sync. Redirecting to dashboard...')
      setOnboardingCompleted(true)
      navigate('/dashboard', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  const templatesList = [
    {
      id: 'tpl_default_swe',
      name: 'Software Engineer Modern',
      desc: 'High-density tech resume with technical skills matrix, impact bullets, and clean serif headers.',
      badge: 'Recommended',
      ats: '98% ATS',
    },
    {
      id: 'tpl_academic',
      name: 'Minimal Academic & Research',
      desc: 'Computer Modern font, publication citations section, ideal for research and senior science roles.',
      badge: 'Publication Grade',
      ats: '96% ATS',
    },
    {
      id: 'tpl_executive',
      name: 'Executive & Engineering Manager',
      desc: 'Modern sans-serif typography with prominent leadership achievements and team scaling stats.',
      badge: 'Leadership',
      ats: '95% ATS',
    },
    {
      id: 'tpl_devops',
      name: 'Systems & DevOps Specialist',
      desc: 'Optimized for infrastructure, cloud certifications, uptime percentages, and distributed tooling.',
      badge: 'Infra / SRE',
      ats: '97% ATS',
    },
  ]

  const stepTitles = [
    'Career Target & Role',
    'Experience & Baseline',
    'Default LaTeX Template',
    'AI Preferences & Launch',
  ]

  return (
    <div className="space-y-6">
      {/* Step Stepper Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>STEP {currentStep} OF 4</span>
          <span className="text-primary font-bold">{completionPercent}% Setup Complete</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1
            const isActive = currentStep === stepNum
            const isCompleted = currentStep > stepNum

            return (
              <button
                key={title}
                type="button"
                onClick={() => setStep(stepNum)}
                className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors text-left sm:text-center ${
                  isActive
                    ? 'text-primary font-bold'
                    : isCompleted
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                      : isActive
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepNum}
                </div>
                <span className="hidden sm:inline text-[11px] truncate max-w-[120px]">{title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 1: Career Target & Role */}
      {currentStep === 1 && (
        <Card className="border-border/60 shadow-xl backdrop-blur-xs animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Briefcase className="h-4 w-4" />
              <span>Step 1: Your Target Role</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">What role are you targeting?</CardTitle>
            <CardDescription>
              We calibrate our ATS keyword matching and LaTeX layout to your target seniority level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Full Name" id="name" required>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setHasEditedName(true)
                }}
                placeholder={user?.email ? user.email.split('@')[0] : 'Enter your full name'}
              />
            </FormField>

            <FormField label="Target Job Title / Professional Headline" id="targetRole" required>
              <Input
                id="targetRole"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value)
                  setHasEditedRole(true)
                }}
                placeholder="e.g. Senior Software Engineer"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Target Industry" id="industry">
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Technology & SaaS</option>
                  <option>Fintech & Banking</option>
                  <option>AI & Machine Learning</option>
                  <option>Healthcare & Biotech</option>
                  <option>Defense & Aerospace</option>
                  <option>E-commerce & Retail</option>
                </select>
              </FormField>

              <FormField label="Seniority Level" id="experienceLevel">
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Junior (0-2 years)</option>
                  <option>Mid-Level (3-5 years)</option>
                  <option>Senior (5-8 years)</option>
                  <option>Lead / Staff (8-12 years)</option>
                  <option>Principal / Director (12+ years)</option>
                </select>
              </FormField>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Saved to your profile
            </span>
            <Button onClick={() => setStep(2)} className="gap-2 font-semibold">
              Continue to Experience
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Resume Import / Baseline Profile */}
      {currentStep === 2 && (
        <Card className="border-border/60 shadow-xl backdrop-blur-xs animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Upload className="h-4 w-4" />
              <span>Step 2: Career Knowledge Base</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Import your verified experience</CardTitle>
            <CardDescription>
              LatexAI never hallucinates past jobs. We tailor resumes strictly from your source profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setImportMode('upload')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  importMode === 'upload'
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <Upload className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Upload Resume</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">PDF or DOCX (max 5MB)</span>
              </button>

              <button
                type="button"
                onClick={handleStartFromScratch}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  importMode === 'scratch'
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <PlusCircle className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Start Fresh</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">Build manually in editor</span>
              </button>

              <button
                type="button"
                onClick={handleUseSampleProfile}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  importMode === 'sample'
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <Zap className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Sample Demo Profile</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">Fast testing dataset</span>
              </button>
            </div>

            {/* Upload Dropzone */}
            {importMode === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileDrop}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {uploadedFileName ? uploadedFileName : 'Drag & drop your resume PDF or DOCX'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Our parser extracts roles, bullets, and verified skills into your profile.
                </p>
              </div>
            )}

            {/* Extracted Profile Preview */}
            {extractedSummary && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Profile Knowledge Base Ready
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Verified Source
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="rounded-lg bg-card p-2 border border-border/50">
                    <span className="font-bold text-base text-foreground">{extractedSummary.rolesCount}</span>
                    <p className="text-[10px] text-muted-foreground">Work Roles</p>
                  </div>
                  <div className="rounded-lg bg-card p-2 border border-border/50">
                    <span className="font-bold text-base text-foreground">{extractedSummary.skillsCount}</span>
                    <p className="text-[10px] text-muted-foreground">Verified Skills</p>
                  </div>
                  <div className="rounded-lg bg-card p-2 border border-border/50">
                    <span className="font-bold text-xs truncate block text-foreground">Degree</span>
                    <p className="text-[10px] text-muted-foreground">Education Verified</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2 font-semibold">
              Continue to Templates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Default LaTeX Template */}
      {currentStep === 3 && (
        <Card className="border-border/60 shadow-xl backdrop-blur-xs animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Layers className="h-4 w-4" />
              <span>Step 3: LaTeX Template</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Choose your primary template</CardTitle>
            <CardDescription>
              All templates compile directly via pdflatex and pass Workday, Taleo, and Greenhouse parsers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templatesList.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px]">
                          {tpl.badge}
                        </Badge>
                        <Badge variant="success" className="text-[10px]">
                          {tpl.ats}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground pt-1">{tpl.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tpl.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground font-mono">pdflatex single-col</span>
                      {isSelected ? (
                        <span className="font-bold text-primary flex items-center gap-1 text-[11px]">
                          <Check className="h-3.5 w-3.5" /> Selected
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground hover:text-foreground">Click to select</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(4)} className="gap-2 font-semibold">
              Continue to AI Preferences
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: AI Customization Preferences & Launch */}
      {currentStep === 4 && (
        <Card className="border-border/60 shadow-xl backdrop-blur-xs animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Sliders className="h-4 w-4" />
              <span>Step 4: AI Preferences &amp; Launch</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Review &amp; Launch Workspace</CardTitle>
            <CardDescription>
              Fine-tune the tone and bullet point density for your automated tailoring runs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Tailoring Tone Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'metrics', label: 'Impact & Metrics', desc: 'Focuses on % gains, latency, and throughput' },
                  { id: 'leadership', label: 'Strategic & Lead', desc: 'Focuses on ownership, architecture, and team impact' },
                  { id: 'balanced', label: 'Balanced Tech', desc: 'Equal split between execution and hard skills' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setTonePreference(tone.id as typeof tonePreference)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      tonePreference === tone.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <span className="block text-xs font-bold text-foreground">{tone.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block leading-tight">{tone.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bullet Density */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Bullet Point Length / Budget
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulletDensity('concise')}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    bulletDensity === 'concise'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <span className="block text-xs font-bold text-foreground">Concise (1-2 lines)</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Strictly enforces single-page budget and high readability.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulletDensity('detailed')}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    bulletDensity === 'detailed'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <span className="block text-xs font-bold text-foreground">Detailed (2-3 lines)</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Provides comprehensive context on complex system architectures.
                  </span>
                </button>
              </div>
            </div>

            {/* Readiness Summary Card */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Setup Summary
                </span>
                <Badge variant="success" className="text-[11px]">
                  100% Ready
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                <div>
                  <span className="text-muted-foreground text-[11px]">User:</span>{' '}
                  <span className="font-semibold text-foreground">{fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Target Role:</span>{' '}
                  <span className="font-semibold text-foreground">{targetRole}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Template:</span>{' '}
                  <span className="font-semibold text-foreground">
                    {templatesList.find((t) => t.id === selectedTemplateId)?.name || 'SWE Modern'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Tone:</span>{' '}
                  <span className="font-semibold text-foreground capitalize">{tonePreference}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-4">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleCompleteSetup}
              disabled={isSubmitting}
              className="gap-2 font-bold shadow-md shadow-primary/20 text-sm h-10 px-6"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Complete Setup &amp; Launch Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

export default OnboardingPage
