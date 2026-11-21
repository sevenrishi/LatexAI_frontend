import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Search,
  ArrowUp,
  X,
  Menu,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const SECTIONS = [
  { id: 'summary', title: '1. Summary in Plain English' },
  { id: 'acceptance', title: '2. Acceptance of Terms & Eligibility' },
  { id: 'service', title: '3. Description of LatexAI Service' },
  { id: 'ip-ownership', title: '4. Intellectual Property & Ownership Rights' },
  { id: 'acceptable-use', title: '5. Acceptable Use Policy & TeX Security' },
  { id: 'ai-disclaimer', title: '6. AI Output & User Verification Responsibility' },
  { id: 'employment', title: '7. Employment Disclaimer (No Hiring Guarantees)' },
  { id: 'compiler-limits', title: '8. LaTeX Engine Limits & Service Availability' },
  { id: 'billing', title: '9. Subscriptions, Invoicing & Refunds' },
  { id: 'liability', title: '10. Limitation of Liability & Indemnity' },
  { id: 'termination', title: '11. Account Deletion & Termination' },
  { id: 'governing-law', title: '12. Governing Law & Dispute Resolution' },
  { id: 'contact', title: '13. Legal Inquiries & Notices' },
]

export function TermsPage() {
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
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold gap-1.5 border-primary/30 text-primary bg-primary/5">
              <Scale className="h-3.5 w-3.5" />
              LatexAI Terms of Service
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Terms & Conditions
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
              Please read these terms carefully before utilizing our career knowledge base, AI tailoring models, and LaTeX compilation engine.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
              <span><strong>Effective Date:</strong> November 22, 2026</span>
              <span>•</span>
              <span><strong>Last Revised:</strong> November 22, 2026</span>
              <span>•</span>
              <span><strong>Version:</strong> 2.4.0</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 cursor-pointer">
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
              <Button variant="secondary" size="sm" asChild className="gap-2">
                <Link to="/privacy">
                  <FileText className="h-4 w-4" />
                  Read Privacy Policy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary Callout */}
      <section className="border-b border-border bg-card/40 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              The 30-Second Summary (What You Agree To)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-muted-foreground">
              <div>
                <strong className="text-foreground block mb-1">1. You Own Your Data</strong>
                Your career facts, uploaded resumes, and generated PDF/TeX documents belong 100% to you.
              </div>
              <div>
                <strong className="text-foreground block mb-1">2. Zero Hallucination Guarantee</strong>
                We anchor generation to your verified facts, but you remain responsible for final fact verification.
              </div>
              <div>
                <strong className="text-foreground block mb-1">3. TeX Sandbox Security</strong>
                Do not inject malicious LaTeX macros, execute shell escapes, or attempt compiler denial-of-service.
              </div>
              <div>
                <strong className="text-foreground block mb-1">4. No Hiring Promises</strong>
                LatexAI prepares superior ATS resumes, but cannot legally guarantee job offers or interviews.
              </div>
            </div>
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
                className={`w-full text-left rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  activeSection === sec.id
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
          {/* Left Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Document Navigation
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
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        activeSection === sec.id
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
                  <p className="font-semibold text-foreground">Have a legal inquiry?</p>
                  <p className="text-muted-foreground text-[11px]">
                    Direct your inquiries to{' '}
                    <a href="mailto:latexai.legal@sevenrishi.tech" className="text-primary underline">
                      latexai.legal@sevenrishi.tech
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Terms Body */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12 text-sm leading-relaxed text-foreground">
            {/* Section 1 */}
            <article id="summary" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">01.</span> Summary in Plain English
              </h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) form a legally binding contract between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and LatexAI Inc. (&ldquo;LatexAI&rdquo;, &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). They govern your access to and use of the LatexAI web application, APIs, LaTeX compilation servers, templates, and resume intelligence tools.
              </p>
              <p>
                By creating an account, clicking &ldquo;Get Started&rdquo;, or accessing any portion of our platform, you signify that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not access or use the Service.
              </p>
            </article>

            {/* Section 2 */}
            <article id="acceptance" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">02.</span> Acceptance of Terms & Eligibility
              </h2>
              <p>
                To use LatexAI, you must be at least sixteen (16) years of age or the age of legal majority in your jurisdiction. By registering, you warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You possess the legal capacity to enter into a binding agreement.</li>
                <li>All profile details, identity records, and work histories submitted represent truthful information regarding your personal career.</li>
                <li>You are not barred from receiving services under the laws of the United States or other applicable jurisdictions.</li>
                <li>You will maintain the security and confidentiality of your login credentials.</li>
              </ul>
            </article>

            {/* Section 3 */}
            <article id="service" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">03.</span> Description of LatexAI Service
              </h2>
              <p>
                LatexAI provides a specialized suite of career engineering software tools, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Profile Knowledge Base:</strong> A structured, centralized database to curate your work experiences, projects, education, skills, and metrics.</li>
                <li><strong>Job Description Analysis & Semantic Match:</strong> Automated evaluation of target job requirements and applicant-tracking keyword densities.</li>
                <li><strong>Deterministic AI Bullet Tailoring:</strong> Contextual reformulation of your real accomplishments into STAR (Situation, Task, Action, Result) bullets tailored to target job descriptions without fabricating credentials.</li>
                <li><strong>Cloud LaTeX Compilation:</strong> Automated rendering of `.tex` markup into vector-crisp, ATS-compliant PDF files using server-side TeX engines.</li>
                <li><strong>Template Editor:</strong> Split-view real-time code editor with live syntax checking and PDF preview.</li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="ip-ownership" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">04.</span> Intellectual Property & Ownership Rights
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground">Your Content (100% User Ownership)</h4>
                  <p className="text-xs text-muted-foreground">
                    You retain complete, exclusive copyright, ownership, and all intellectual property rights to your personal career data, uploaded resumes, generated content, and compiled PDF outputs. LatexAI asserts zero ownership claims over your career documents.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground">Limited Service License</h4>
                  <p className="text-xs text-muted-foreground">
                    You grant LatexAI a strictly limited, non-exclusive, worldwide license solely to store, process, reformat, and compile your data to provide the Service to you. This license terminates automatically when you remove content or delete your account.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground">LatexAI Platform IP</h4>
                  <p className="text-xs text-muted-foreground">
                    LatexAI and its licensors retain all rights, title, and interest in and to the platform codebase, LaTeX template designs, UI styling, ATS scoring algorithms, logos, and trademarks. You may not reverse engineer, decompile, or scrape the platform.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 5 */}
            <article id="acceptable-use" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">05.</span> Acceptable Use Policy & TeX Security
              </h2>
              <p>
                Because LaTeX allows powerful low-level macro expansion, we enforce strict automated security measures. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Inject malicious TeX code designed to trigger shell escapes (<code className="font-mono text-xs">\write18</code>), arbitrary command execution, or local file inclusion.</li>
                <li>Attempt to trigger infinite compilation loops, memory exhaustion, or denial-of-service against our compilation clusters.</li>
                <li>Use automated scripts, bots, or headless crawlers to extract template sources or bypass rate limits.</li>
                <li>Submit fraudulent, forged, or counterfeit professional credentials or degrees.</li>
                <li>Upload materials containing malware, trojans, ransomware, or defamatory content.</li>
              </ul>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Any attempt to probe, breach, or exploit the LaTeX sandbox infrastructure will result in immediate account termination, IP blocking, and reporting to relevant cyber authorities.
                </span>
              </div>
            </article>

            {/* Section 6 */}
            <article id="ai-disclaimer" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">06.</span> AI Output & User Verification Responsibility
              </h2>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Mandatory User Review Obligation
                </div>
                <p className="text-xs text-muted-foreground">
                  While LatexAI implements strict anti-hallucination guardrails and anchors all generated text to your Profile Knowledge Base, artificial intelligence can produce nuanced variations, rewordings, or formatting discrepancies.
                </p>
              </div>

              <p>
                <strong>You are solely responsible for inspecting and verifying all statements, numbers, metrics, dates, and claims on your compiled resume prior to sending it to any prospective employer or third party.</strong>
              </p>
              <p>
                LatexAI disclaims any liability for employment disputes, rescinded offers, or misrepresentation allegations arising from the use of AI-assisted resume content.
              </p>
            </article>

            {/* Section 7 */}
            <article id="employment" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">07.</span> Employment Disclaimer (No Hiring Guarantees)
              </h2>
              <p>
                LatexAI provides typesetting and resume structuring software. We do not operate as an employment agency, headhunter, or staffing service.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>We make no warranties, representations, or guarantees that using LatexAI will result in job interviews, recruiter callbacks, employment offers, or salary increases.</li>
                <li>ATS scores generated on our platform are algorithmic estimates intended to guide resume optimization; different employers configure their commercial ATS parsers (Workday, Greenhouse, Lever, etc.) according to proprietary, varying criteria.</li>
              </ul>
            </article>

            {/* Section 8 */}
            <article id="compiler-limits" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">08.</span> LaTeX Engine Limits & Service Availability
              </h2>
              <p>
                To maintain high availability and fair multi-tenant performance:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Compilation Timeout:</strong> Server-side LaTeX compilation jobs are capped at 15 seconds execution time. Macros exceeding this limit are terminated with a compilation error.</li>
                <li><strong>File Size Constraints:</strong> Custom templates and image assets are restricted to standard document limits (under 5MB).</li>
                <li><strong>Scheduled Maintenance:</strong> We strive for 99.9% uptime, but the service is provided &ldquo;As-Is&rdquo; and &ldquo;As-Available&rdquo;. We do not guarantee uninterrupted or error-free compiler operations.</li>
              </ul>
            </article>

            {/* Section 9 */}
            <article id="billing" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">09.</span> Subscriptions, Invoicing & Refunds
              </h2>
              <p>
                LatexAI offers both free tier access and premium Pro subscriptions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Billing Cycles:</strong> Paid plans are billed in advance on a recurring monthly or annual basis. You may cancel at any time through your Account Settings.</li>
                <li><strong>Cancellation:</strong> Upon cancellation, your Pro features remain active until the end of your current paid billing period.</li>
                <li><strong>14-Day Refund Policy:</strong> If you are dissatisfied with a first-time Pro subscription, you may request a full refund within 14 calendar days of your initial purchase by contacting <a href="mailto:latexai.support@sevenrishi.tech" className="text-primary underline">latexai.support@sevenrishi.tech</a>.</li>
              </ul>
            </article>

            {/* Section 10 */}
            <article id="liability" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">10.</span> Limitation of Liability & Indemnity
              </h2>
              <p className="uppercase text-xs font-semibold tracking-wider text-muted-foreground">
                To the maximum extent permitted by applicable law:
              </p>
              <p>
                LatexAI Inc., its directors, employees, and suppliers shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profits, employment opportunities, data loss, or business interruption.
              </p>
              <p>
                In no event shall our cumulative aggregate liability exceed the total amount paid by you to LatexAI in the twelve (12) months preceding the incident, or fifty US dollars ($50.00), whichever is greater.
              </p>
              <p>
                You agree to defend, indemnify, and hold harmless LatexAI against any third-party claims, liabilities, damages, and expenses (including legal fees) arising from your breach of these Terms or the content of resumes you distribute.
              </p>
            </article>

            {/* Section 11 */}
            <article id="termination" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">11.</span> Account Deletion & Termination
              </h2>
              <p>
                You may terminate your account at any time via <Link to="/settings" className="text-primary underline">Settings &gt; Danger Zone</Link>. Upon deletion, your career knowledge base and resume history will be permanently erased.
              </p>
              <p>
                LatexAI reserves the right to suspend or terminate access immediately, without prior notice, if you breach these Terms, compromise platform security, or engage in abusive behavior.
              </p>
            </article>

            {/* Section 12 */}
            <article id="governing-law" className="space-y-4 scroll-mt-24 border-b border-border pb-8">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">12.</span> Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
              </p>
              <p>
                In the event of any dispute, the parties agree to first attempt informal resolution in good faith for at least thirty (30) days by contacting <a href="mailto:latexai.legal@sevenrishi.tech" className="text-primary underline">latexai.legal@sevenrishi.tech</a> before initiating formal arbitration proceedings.
              </p>
            </article>

            {/* Section 13 */}
            <article id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span className="text-primary font-mono text-base">13.</span> Legal Inquiries & Notices
              </h2>
              <p>
                Formal legal notices, DMCA copyright requests, or contractual queries may be addressed to:
              </p>
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">LatexAI Legal Department</h4>
                    <p className="text-xs text-muted-foreground">Inquiries answered by legal counsel</p>
                  </div>
                </div>
                <div className="pt-2 text-xs space-y-1 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:latexai.legal@sevenrishi.tech" className="text-primary hover:underline">latexai.legal@sevenrishi.tech</a></p>
                  <p><strong>Physical Mail:</strong> LatexAI Inc., Attn: Legal Counsel, 548 Market St, Suite 78100, San Francisco, CA 94104</p>
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

export default TermsPage