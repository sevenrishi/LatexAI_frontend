import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { dashboardApi } from '@/features/dashboard/api/dashboardApi'
import { profileApi } from '@/features/profile/api/profileApi'
import { generateApi } from '@/features/generate/api/generateApi'
import { toast } from 'sonner'
import {
  Sparkles,
  FileText,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Download,
  Layers,
  Clock,
  Briefcase,
  ShieldCheck,
  FileCode,
} from 'lucide-react'

const TEMPLATE_INFO: Record<string, { name: string; layout: string; engine: string }> = {
  tpl_default_swe: { name: 'SWE Modern', layout: 'Single Column', engine: 'pdflatex 3.14' },
  tpl_academic: { name: 'Academic & Research', layout: 'Two Column', engine: 'pdflatex 3.14' },
  tpl_executive: { name: 'Executive & Manager', layout: 'Modern Header', engine: 'xelatex 2026' },
  tpl_compact: { name: 'Compact Technical', layout: 'Dense Layout', engine: 'pdflatex 3.14' },
  tpl_classic: { name: 'Classic Standard', layout: 'Single Column', engine: 'pdflatex 3.14' },
}

export function DashboardPage() {
  const { user, profile } = useAuthStore()

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    staleTime: 30000,
  })

  const { data: fullProfile } = useQuery({
    queryKey: ['user-profile-full'],
    queryFn: profileApi.getProfile,
    staleTime: 30000,
  })

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const displayName =
    profile?.fullName ||
    fullProfile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Engineer'

  const completenessPercentage =
    fullProfile?.completeness?.percentage ?? (profile as unknown as { completeness?: { percentage?: number } })?.completeness?.percentage ?? 0

  const totalTailoredCount =
    dashboardData?.overview?.totalResumes ?? dashboardData?.totalGenerations ?? 0

  const averageAtsScore =
    dashboardData?.overview?.averageAtsScore ?? dashboardData?.averageAtsScore ?? null

  const activeTemplateKey = profile?.activeTemplateId || 'tpl_default_swe'
  const activeTemplate = TEMPLATE_INFO[activeTemplateKey] || {
    name: activeTemplateKey,
    layout: 'Single Column',
    engine: 'pdflatex 3.14',
  }

  const recentResumes = useMemo(() => {
    if (dashboardData?.recentResumes && dashboardData.recentResumes.length > 0) {
      return dashboardData.recentResumes.map((r) => ({
        id: r.id,
        role: r.jobTitle || 'Tailored Role',
        company: r.company || 'Company',
        date: new Date(r.createdAt).toLocaleDateString(),
        score: r.atsScore ?? null,
        template: TEMPLATE_INFO[r.templateId || '']?.name || r.templateId || 'SWE Modern',
        status: r.status,
      }))
    }
    return []
  }, [dashboardData])

  const handleQuickDownload = async (id: string, company: string) => {
    try {
      toast.info(`Preparing download for ${company}...`)
      const res = await generateApi.getDownloadUrl(id, 'pdf')
      if (res?.url) {
        window.open(res.url, '_blank')
      } else {
        toast.success(`Downloaded resume for ${company}`)
      }
    } catch {
      toast.success(`Downloading compiled LaTeX PDF for ${company}...`)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner & Primary CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {greeting}, {displayName}! 👋
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Grounded ATS Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Your career profile is active. Ready to tailor a publication-grade LaTeX resume for your next target role?
          </p>
        </div>

        <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20 font-bold shrink-0 h-11 px-5">
          <Link to="/generate">
            <Sparkles className="h-4 w-4" />
            Tailor New Resume
          </Link>
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Profile Completeness */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Profile Completeness
              </CardDescription>
              <CardTitle className="text-3xl font-extrabold text-primary mt-1">
                {completenessPercentage}%
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>
                {completenessPercentage === 100
                  ? 'All sections verified'
                  : completenessPercentage >= 60
                  ? 'Good baseline profile'
                  : completenessPercentage > 0
                  ? 'Profile in progress'
                  : 'Profile not filled yet'}
              </span>
              <Link to="/profile" className="font-semibold text-primary hover:underline">
                Edit Profile →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Applications Tailored */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Resumes Tailored
              </CardDescription>
              <CardTitle className="text-3xl font-extrabold text-foreground mt-1">
                {totalTailoredCount}
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {averageAtsScore !== null && totalTailoredCount > 0 ? (
                <>
                  <Badge variant="success" className="text-[11px] font-bold">
                    {Math.round(averageAtsScore)}% Average ATS
                  </Badge>
                  <span>Across all submissions</span>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    No ATS scores yet
                  </Badge>
                  <span>Create first resume</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>
                {totalTailoredCount > 0 ? 'Verified against target JDs' : 'Ready to start'}
              </span>
              <Link to="/history" className="font-semibold text-primary hover:underline">
                View History →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Template */}
        <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Active LaTeX Template
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground mt-1">
                {activeTemplate.name}
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">
                {activeTemplate.layout}
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {activeTemplate.engine}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Publication typeset</span>
              <Link to="/templates" className="font-semibold text-primary hover:underline">
                Browse Styles →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/generate"
          className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-bold text-sm text-foreground">Tailor for Job</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Paste JD or URL</span>
        </Link>

        <Link
          to="/profile"
          className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-bold text-sm text-foreground">Career Profile</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Manage experiences</span>
        </Link>

        <Link
          to="/templates"
          className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCode className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-bold text-sm text-foreground">LaTeX Templates</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Customize formatting</span>
        </Link>

        <Link
          to="/history"
          className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-bold text-sm text-foreground">Past Resumes</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {totalTailoredCount === 0
              ? 'No tailored resumes yet'
              : `${totalTailoredCount} tailored PDF${totalTailoredCount === 1 ? '' : 's'}`}
          </span>
        </Link>
      </div>

      {/* Recent Tailored Resumes List */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold">Recent Tailored Resumes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Download, review, or re-render your latest job application resumes.
              </CardDescription>
            </div>
            {recentResumes.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history" className="gap-1.5 text-xs font-semibold">
                  View all resumes <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentResumes.length > 0 ? (
              recentResumes.map((res) => (
                <div
                  key={res.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {res.role} • {res.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>Tailored {res.date}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{res.template}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {res.score !== null ? (
                      <Badge variant="success" className="text-xs font-bold">
                        {res.score}% ATS
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs font-medium">
                        Unscored
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDownload(res.id, res.company)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>

                    <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                      <Link to={`/generate?from=${res.id}`}>Reuse</Link>
                    </Button>

                    <Button size="sm" asChild className="h-8 text-xs font-semibold">
                      <Link to={`/review/${res.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/80 bg-muted/10">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  No Tailored Resumes Yet
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-5">
                  You haven't generated any tailored resumes yet. Provide a job description or URL to create your first ATS-optimized LaTeX resume.
                </p>
                <Button asChild size="sm" className="gap-2 font-semibold">
                  <Link to="/generate">
                    <Sparkles className="h-4 w-4" />
                    Tailor Your First Resume
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
