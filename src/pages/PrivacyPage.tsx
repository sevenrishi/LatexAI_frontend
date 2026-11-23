import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  Cpu,
  Trash2,
  FileCheck2,
  Search,
  Mail,
  Printer,
  Database,
  ArrowUp,
  X,
  Menu,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

const SECTIONS = [
  { id: 'summary', title: '1. Executive Privacy Overview' },
  { id: 'collection', title: '2. Information We Collect' },
  { id: 'usage', title: '3. How We Use Your Information' },
  { id: 'ai-processing', title: '4. AI Architecture & Zero-Training Pledge' },
  { id: 'latex-sandbox', title: '5. LaTeX Compilation & Ephemeral Storage' },
  { id: 'security', title: '6. Data Storage & Security Standards' },
  { id: 'rights', title: '7. Your Rights (GDPR, CCPA & Global Laws)' },
  { id: 'cookies', title: '8. Cookies & Local Browser Storage' },
  { id: 'sharing', title: '9. Third-Party Sub-processors & Service Providers' },
  { id: 'retention', title: '10. Data Retention & Account Deletion' },
  { id: 'children', title: '11. Children’s Privacy' },
  { id: 'changes', title: '12. Updates to this Policy' },
  { id: 'contact', title: '13. Data Protection Officer & Contact' },
]

export function PrivacyPage() {
  const user = useAuthStore((s) => s.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('summary')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS
    return SECTIONS.filter((s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Scroll spy to highlight active section in TOC
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)

      const sectionElements = SECTIONS.map((sec) => document.getElementById(sec.id)).filter(Boolean)
      const scrollPos = window.scrollY + 120

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i]
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const scrollTo = (id: string) => {
    setActiveSection(id)
    setMobileNavOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const yOffset = -85
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-card to-background py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Privacy Policy
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
              We treat your career data with the highest standard of confidentiality.
              Our zero-hallucination engine compiles your resume without training public AI models on your personal history.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
              <span><strong>Effective Date:</strong> November 22, 2026</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> November 22, 2026</span>
              <span>•</span>
              <span><strong>Version:</strong> 2.4.0</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 cursor-pointer">
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
              {user ? (
                <Button variant="secondary" size="sm" asChild className="gap-2">
                  <Link to="/settings">
                    <Database className="h-4 w-4" />
                    Manage My Data in Settings
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" size="sm" asChild className="gap-2">
                  <Link to="/login?redirectTo=/settings">
                    <Database className="h-4 w-4" />
                    Sign In to Manage Data
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars Grid */}
      <section className="border-b border-border bg-card/40 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 bg-card shadow-xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">Zero AI Model Training</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your resumes, skills, and work histories are strictly never used to train or fine-tune public foundation AI models.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">TLS 1.3 & AES-256</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All transmissions are encrypted via high-grade TLS 1.3, and database records use AES-256 storage with strict Supabase Row-Level Security.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">Ephemeral pdflatex Sandboxes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  LaTeX compile builds occur in isolated memory sandboxes. Temporary auxiliary `.aux`, `.log`, and `.out` files are wiped post-compilation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">Complete Erasure & Export</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You retain 100% ownership. Download your complete profile in portable JSON or permanently delete your account with one click.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile Table of Contents Quick Nav */}
      <div className="lg:hidden sticky top-16 z-30 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Jump to Section:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="text-xs h-8 gap-1.5"
          >
            <Menu className="h-3.5 w-3.5" />
            <span>{SECTIONS.find((s) => s.id === activeSection)?.title || 'Navigation'}</span>
          </Button>
        </div>
        {mobileNavOpen && (
          <div className="mt-2 space-y-1 rounded-lg border border-border bg-card p-2 shadow-lg max-h-64 overflow-y-auto">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`w-full text-left rounded-md px-2.5 py-1.5 text-xs transition-colors ${activeSection === sec.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Policy Contents
                </h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-7 text-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {filteredSections.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground space-y-2">
                  <p>No matching sections</p>
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="h-6 text-xs gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </div>
              ) : (
                <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {filteredSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollTo(sec.id)}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${activeSection === sec.id
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      {sec.title}
                    </button>
                  ))}
                </nav>
              )}

              <div className="border-t border-border pt-3">
                <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-1.5">
                  <p className="font-semibold text-foreground">Need quick clarification?</p>
                  <p className="text-muted-foreground text-[11px]">
                    Our Data Protection Officer can be reached directly at{' '}
                    <a href="mailto:latexai.privacy@sevenrishi.tech" className="text-primary underline">
                      latexai.privacy@sevenrishi.tech
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Document Body */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12 text-sm leading-relaxed text-foreground">
            {/* Section 1 */}
            <article id="summary" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">01.</span> Executive Privacy Overview
              </h2>
              <p>
                Kolomly Inc. (&ldquo;Kolomly&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides an intelligent, ATS-optimized LaTeX resume compilation platform designed to empower job applicants worldwide. Our foundational architecture is grounded in <strong>zero-hallucination deterministic generation</strong>: we assist you in tailoring, formatting, and rendering your verified professional accomplishments without embellishing, falsifying, or sharing your career trajectory with unauthorized third parties.
              </p>
              <p>
                This Privacy Policy explains what personal information we collect, why we collect it, how it is processed by our systems and artificial intelligence engines, and the stringent security safeguards we maintain under the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act as amended by the CPRA (CCPA), and applicable global data protection frameworks.
              </p>
            </article>

            {/* Section 2 */}
            <article id="collection" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">02.</span> Information We Collect
              </h2>
              <p>
                To provide you with publication-grade LaTeX resumes tailored to specific career opportunities, we collect information across three categories:
              </p>

              <div className="space-y-4 pl-2">
                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    A. Personal Account Credentials
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    When you register for Kolomly, we collect your full name, email address, hashed authentication credentials, and timestamps. If you authenticate via OAuth providers (such as Google or GitHub via Supabase Auth), we receive your primary email address and public avatar image as authorized by your provider consent.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    B. Career Profile Knowledge Base & Uploaded Resumes
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your Profile Knowledge Base contains personal information that you intentionally input or import: work history, company names, job titles, employment dates, quantified metrics, educational degrees, GPAs (optional), certifications, technical skills, open-source portfolio URLs, and contact details (phone, LinkedIn, GitHub, location).
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    C. Target Job Descriptions & Generation Inputs
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    When you run our resume tailoring engine, you submit employer job listings, job titles, and job requirements. We store these temporarily to compute keyword overlap, calculate ATS match scores, and track your job application pipeline in your History dashboard.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    D. Technical Diagnostics & Compile Telemetry
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    We automatically record IP addresses, browser agent headers, operating system versions, LaTeX compilation durations, error codes (such as missing TeX packages or syntax errors), and API latency to maintain compiler health and prevent denial-of-service abuse.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 3 */}
            <article id="usage" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">03.</span> How We Use Your Information
              </h2>
              <p>We process your data strictly to deliver and improve the Kolomly service:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Deterministic Resume Tailoring:</strong> Aligning verified achievements in your Profile Knowledge Base with keywords present in target job descriptions.</li>
                <li><strong className="text-foreground">LaTeX Compilation & Rendering:</strong> Converting structured JSON career schemas into TeX syntax and compiling them via server-side <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-mono">pdflatex</code> into high-resolution, vector-crisp PDF documents.</li>
                <li><strong className="text-foreground">ATS Scoring & Optimization:</strong> Evaluating your resume against simulated applicant tracking system parsers to highlight missing industry skills and formatting bottlenecks.</li>
                <li><strong className="text-foreground">Authentication & Account Management:</strong> Authenticating sessions, managing password resets, and enforcing workspace permissions.</li>
                <li><strong className="text-foreground">Security & Anti-Abuse:</strong> Protecting our server-side LaTeX compilation infrastructure from malicious TeX macro injections, infinite compilation loops, and credential attacks.</li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="ai-processing" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">04.</span> AI Architecture & Zero-Training Pledge
              </h2>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                  Our Irrevocable Zero-Training Guarantee
                </div>
                <p className="text-xs text-muted-foreground">
                  Kolomly contracts exclusively with enterprise AI model providers (including Google Cloud Vertex AI, OpenAI Enterprise, and Anthropic Claude via commercial APIs) whose agreements explicitly prohibit the use of customer API inputs for model training or public weights refinement.
                </p>
              </div>

              <p>
                When our AI assists in phrasing a resume bullet or extracting key competencies from a job description:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Data is transmitted over encrypted TLS 1.3 tunnels solely for real-time inference.</li>
                <li>Prompt payloads contain only the specific context required to generate the output (e.g. your raw bullet point and the target job description requirements).</li>
                <li>Neither Kolomly nor our upstream API providers retain your career records for generative model training or algorithmic profiling.</li>
                <li>Our prompts enforce <strong>strict fact-anchoring</strong>: the model is instructed never to fabricate employers, dates, metrics, or degrees not verified in your Profile KB.</li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="latex-sandbox" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">05.</span> LaTeX Compilation & Ephemeral Storage
              </h2>
              <p>
                Compiling LaTeX into ATS-compliant PDFs requires server-side execution of TeX distributions. We implement a security-hardened container pipeline:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                  <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Isolated Workers</h4>
                  <p className="text-xs text-muted-foreground">
                    Compilations execute in sandboxed, non-privileged Linux containers with read-only root filesystems and restricted network access.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                  <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Immediate Cleanup</h4>
                  <p className="text-xs text-muted-foreground">
                    Temporary TeX artifacts (<code className="font-mono text-[11px]">.aux</code>, <code className="font-mono text-[11px]">.log</code>, <code className="font-mono text-[11px]">.fls</code>) are stored in transient RAM disks (<code className="font-mono text-[11px]">/tmp</code>) and immediately wiped once the final PDF is rendered.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 6 */}
            <article id="security" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">06.</span> Data Storage & Security Standards
              </h2>
              <p>
                We apply defense-in-depth cybersecurity protocols across all infrastructure layers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Database Level:</strong> We leverage Supabase PostgreSQL with automated daily snapshots and strict Row Level Security (RLS) policies. Every query is scoped to the authenticated user ID.</li>
                <li><strong className="text-foreground">Encryption at Rest:</strong> Database tables, object storage buckets, and backups are encrypted using AES-256 keys.</li>
                <li><strong className="text-foreground">Encryption in Transit:</strong> 100% of network traffic between your browser, our application servers, and database clusters is encrypted using TLS 1.3 with modern cipher suites.</li>
                <li><strong className="text-foreground">Credential Protection:</strong> User passwords are never stored in plaintext; they are salted and hashed using bcrypt with robust work factors.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="rights" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">07.</span> Your Rights (GDPR, CCPA & Global Laws)
              </h2>
              <p>
                Regardless of your geographic location, Kolomly honors comprehensive personal privacy rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary">Right to Access & Portability</h4>
                  <p className="text-xs text-muted-foreground">
                    You can inspect all profile records directly inside your Profile KB. You can also export your entire career history as a structured JSON file at any time via Settings &gt; Data Export.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary">Right to Erasure (&ldquo;To Be Forgotten&rdquo;)</h4>
                  <p className="text-xs text-muted-foreground">
                    You can permanently purge individual resume revisions or completely delete your account in Settings &gt; Danger Zone. Deletion cascades across all tables and is irreversible.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary">Right to Rectification</h4>
                  <p className="text-xs text-muted-foreground">
                    You maintain continuous, unconstrained editing access over your personal records, job titles, achievements, and contact information.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-primary">No Selling or Sharing of Data</h4>
                  <p className="text-xs text-muted-foreground">
                    Kolomly does not sell, rent, monetize, or trade your personal or career data to advertisers, headhunters, or third-party data brokers.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 8 */}
            <article id="cookies" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">08.</span> Cookies & Local Browser Storage
              </h2>
              <p>
                Kolomly does not deploy invasive cross-site advertising pixels or behavioral trackers. We use local storage and cookies strictly for functional operations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Authentication Tokens:</strong> Secure HTTP-only session tokens provided by Supabase Auth to keep you securely signed in.</li>
                <li><strong className="text-foreground">UI Preferences:</strong> Browser <code className="font-mono text-xs">localStorage</code> entries storing your chosen color mode (<code className="font-mono text-xs">theme: light | dark | system</code>) and sidebar collapsed states.</li>
                <li><strong className="text-foreground">Unsaved Editor Drafts:</strong> Temporary local memory buffers in the Template Editor to prevent loss of work during unexpected page refreshes.</li>
              </ul>
            </article>

            {/* Section 9 */}
            <article id="sharing" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">09.</span> Third-Party Sub-processors & Service Providers
              </h2>
              <p>
                We partner with select, ISO/IEC 27001 or SOC 2 Type II certified service providers to execute infrastructure functions:
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 font-semibold text-foreground">
                    <tr>
                      <th className="p-3">Partner / Provider</th>
                      <th className="p-3">Function</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Data Safeguards</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr>
                      <td className="p-3 font-medium text-foreground">Supabase Inc.</td>
                      <td className="p-3">Database, Auth & Object Storage</td>
                      <td className="p-3">United States / EU</td>
                      <td className="p-3">SOC 2 Type II, AES-256, RLS</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Google Cloud Platform</td>
                      <td className="p-3">Cloud Hosting & Generative AI APIs</td>
                      <td className="p-3">Global Regions</td>
                      <td className="p-3">ISO 27001, Zero-training enterprise terms</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">OpenAI L.L.C.</td>
                      <td className="p-3">AI Semantic Analysis (Optional)</td>
                      <td className="p-3">United States</td>
                      <td className="p-3">Commercial API zero-retention pledge</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Section 10 */}
            <article id="retention" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">10.</span> Data Retention & Account Deletion
              </h2>
              <p>
                We retain your career information as long as your account remains active so you can continue updating resumes across your career. If you decide to close your account:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You can initiate deletion at any time in <Link to="/settings" className="text-primary underline">Settings &gt; Danger Zone</Link>.</li>
                <li>Your profile records, resume versions, uploaded files, and generation histories are permanently purged from active databases within 24 hours.</li>
                <li>Automated disaster recovery backups expire and overwrite within 30 days.</li>
              </ul>
            </article>

            {/* Section 11 */}
            <article id="children" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">11.</span> Children’s Privacy
              </h2>
              <p>
                Kolomly is an employment application preparation tool intended for working professionals and university students. The service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware of an account registered by a child under 16, we will immediately terminate the account and purge all associated records.
              </p>
            </article>

            {/* Section 12 */}
            <article id="changes" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">12.</span> Updates to this Policy
              </h2>
              <p>
                We periodically review this policy to reflect new capabilities, compiler enhancements, or evolving legal statutes. When material changes are made, we will notify you by updating the &ldquo;Last Updated&rdquo; date at the top of this document, and when appropriate, displaying an in-app notice or sending an email notification to your registered address.
              </p>
            </article>

            {/* Section 13 */}
            <article id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">13.</span> Data Protection Officer & Contact
              </h2>
              <p>
                If you have questions, inquiries, or would like to exercise any of your data protection rights, please contact our Data Governance and Privacy team:
              </p>
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Kolomly Privacy & Legal Office</h4>
                    <p className="text-xs text-muted-foreground">Dedicated response within 48 business hours</p>
                  </div>
                </div>
                <div className="pt-2 text-xs space-y-1 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:latexai.privacy@sevenrishi.tech" className="text-primary hover:underline">latexai.privacy@sevenrishi.tech</a></p>
                  <p><strong>Security Inquiries:</strong> <a href="mailto:latexai.security@sevenrishi.tech" className="text-primary hover:underline">latexai.security@sevenrishi.tech</a></p>
                  <p><strong>Address:</strong> Kolomly Inc., 548 Market St, Suite 78100, San Francisco, CA 94104</p>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default PrivacyPage