import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCode2,
  Cpu,
  BarChart3,
  Terminal,
  Layers,
  ChevronDown,
  Check,
  X,
  FileText,
  Percent,
  Clock,
} from 'lucide-react'

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('swe-modern')

  const templates = [
    {
      id: 'swe-modern',
      name: 'Software Engineer Modern',
      desc: 'Optimized for high-density tech roles, skills matrices, and impact metrics.',
      tag: 'Most Popular',
      ats: '98% Match',
      font: 'Latin Modern Roman (Computer Modern)',
      previewLines: [
        'Alex Rivera — Senior Full Stack & AI Systems Engineer',
        'EXPERIENCE: Scaled real-time streaming pipeline to 120k req/sec with Golang & Kafka',
        'SKILLS: TypeScript, React 19, Python, Kubernetes, PostgreSQL, LaTeX pdflatex',
      ],
    },
    {
      id: 'academic-classic',
      name: 'Minimal Academic & Research',
      desc: 'Classic serif layout, formal section dividers, ideal for PhDs and researchers.',
      tag: 'Publication Ready',
      ats: '96% Match',
      font: 'Times / Computer Modern Serif',
      previewLines: [
        'Dr. Elena Vance — Lead Machine Learning Scientist',
        'PUBLICATIONS: 8 first-author papers in NeurIPS & ICML on grounded LLM verification',
        'EDUCATION: Ph.D. in Computer Science, Stanford University',
      ],
    },
    {
      id: 'executive-clean',
      name: 'Executive & Engineering Manager',
      desc: 'Clean sans-serif headings, cross-functional achievements, and leadership highlights.',
      tag: 'Leadership',
      ats: '95% Match',
      font: 'Helvetica / TeX Gyre Heros',
      previewLines: [
        'Marcus Thorne — Director of Engineering',
        'LEADERSHIP: Led organization of 45 engineers across 4 globally distributed teams',
        'BUDGET & STRATEGY: Delivered $14M ARR platform migration on schedule',
      ],
    },
  ]

  const faqs = [
    {
      q: 'Why should I use LaTeX instead of Microsoft Word or Google Docs for my resume?',
      a: 'Standard word processors generate complex layout tables, hidden text boxes, and erratic kerning that trip up ATS parsers like Workday and Greenhouse. Pure pdflatex outputs mathematically precise single-column text hierarchies with flawless character encoding that ATS parsers extract with 99.8% fidelity.',
    },
    {
      q: 'How does LatexAI guarantee zero hallucination?',
      a: 'Unlike generic chatbots that make up past companies or embellish metrics, LatexAI strictly grounds every generated bullet in your verified profile. We run an automated traceability verification pass: if an AI-generated bullet cannot be directly traced to a verified fact in your profile, it is rejected and safely reverted.',
    },
    {
      q: 'Do I need to know LaTeX syntax to use this platform?',
      a: 'No. The entire system is visual and automated. You simply maintain your profile, paste the job posting or URL, and our server compiles the LaTeX document automatically. However, if you are a LaTeX power user, you can also view, edit, and download the raw .tex code or open it in Overleaf with one click.',
    },
    {
      q: 'How does the ATS score calculation work?',
      a: 'We perform deterministic token extraction across both the target Job Description and your tailored resume. The score evaluates mandatory hard skills, seniority signals, domain keywords, and strict formatting rules to provide an exact percentage match.',
    },
    {
      q: 'Can I export both PDF and LaTeX source files?',
      a: 'Yes! Every tailored version includes immediate one-click downloads for the publication-grade compiled PDF and the sanitized, reproducible .tex source archive.',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/15%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 gap-1.5 py-1 px-3 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Deterministic ATS Engine • Zero-Hallucination pdflatex
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Tailor Your Resume with AI.{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Compiled into Flawless LaTeX.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              LatexAI grounds every tailored resume strictly in your verified career history. No invented roles, no fake metrics — just mathematically perfect LaTeX that beats every ATS filter.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20 text-base h-12 px-6">
                <Link to="/register">
                  Start Tailoring Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-12 px-6">
                <a href="#templates">Explore LaTeX Templates</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No LaTeX knowledge required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 99.4% ATS parser compatibility
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% verified facts
              </span>
            </div>
          </div>

          {/* Hero Showcase Preview */}
          <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card/70 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Left Column: Target JD & Matched Keywords */}
              <div className="flex-1 space-y-4 rounded-xl border border-border/60 bg-muted/30 p-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Target Job Description Match
                    </span>
                  </div>
                  <Badge variant="success" className="text-xs">
                    97% ATS Match Score
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Target Role:</p>
                  <p className="text-sm font-bold text-foreground">Staff Infrastructure Engineer • Stripe</p>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">Extracted JD Keywords Grounded:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Distributed Systems', 'Kubernetes Orchestration', 'Go / Golang', 'Kafka Event Streaming', '99.99% Availability', 'pdflatex'].map(
                      (kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          <Check className="h-3 w-3" /> {kw}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-card p-3 border border-border/50 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between text-foreground font-medium">
                    <span>Traceability Check</span>
                    <span className="text-emerald-500 font-bold">100% Passed</span>
                  </div>
                  <p className="text-[11px]">All 8 bullet points mapped directly to verified source ID entities.</p>
                </div>
              </div>

              {/* Right Column: High Quality LaTeX PDF Preview Snippet */}
              <div className="flex-1 rounded-xl border border-border/80 bg-background p-5 shadow-inner flex flex-col justify-between">
                <div className="space-y-3 font-serif">
                  <div className="border-b border-foreground/20 pb-2 text-center">
                    <h3 className="text-lg font-bold tracking-normal uppercase text-foreground">
                      Alex Rivera
                    </h3>
                    <p className="text-[11px] text-muted-foreground tracking-tight">
                      San Francisco, CA • alex@latexai.dev • github.com/alexrivera • (555) 234-5678
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-foreground/10 pb-0.5">
                      Professional Experience
                    </h4>
                    <div className="text-[11px] space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Staff Distributed Systems Engineer</span>
                        <span className="text-muted-foreground">2023 — Present</span>
                      </div>
                      <p className="italic text-muted-foreground text-[10px]">CloudScale Systems, San Francisco</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground leading-relaxed pl-1">
                        <li>
                          Architected high-throughput Kafka streaming pipeline processing 120,000 req/sec with sub-5ms p99 latency.
                        </li>
                        <li>
                          Led migration of 200+ microservices to Kubernetes clusters, achieving 99.99% service availability.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-muted-foreground">pdflatex 3.14159265 • 1 Page Validated</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">Single-Column ATS Safe</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-border/60 bg-muted/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl font-extrabold text-foreground">
                <span>99.4</span>
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                ATS Parser Pass Rate
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl font-extrabold text-foreground">
                <span>&lt; 3.0</span>
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                pdflatex Compile Speed
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-foreground">
                100%
              </div>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Verified Grounded Facts
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-foreground">
                0%
              </div>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                AI Hallucinations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 lg:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Engineered for Engineers, Researchers & Leaders
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              Traditional resume builders output corrupt PDF binary streams. We compile deterministic LaTeX on cloud microservices with rigorous automated checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Pure LaTeX Compilation</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  No HTML-to-PDF canvas rasterization. We compile native pdflatex documents with Computer Modern and TeX Gyre typography for impeccable micro-typesetting.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Zero-Hallucination Grounding</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Our pipeline verifies every generated bullet point against your profile entity IDs. If an AI embellishment cannot be proven, our remediation policy restores source truth.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Deterministic ATS Scoring</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Get a breakdown of target keywords, required technical skills, format compliance, and one-page budget enforcement before submitting.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Terminal className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Source .tex & Overleaf Export</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Download the raw reproducible LaTeX source files anytime. Open directly in Overleaf or compile locally on your own machine.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">PDF & DOCX Resume Importer</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Upload your legacy resume to automatically extract experiences, bullet points, skills, GPA, and degrees into your master career knowledge base.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-sm hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Strict 1-Page Constraint</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  The automated LaTeX compiler iteratively verifies page count. If your resume spills over to page 2 by 3 lines, it adjusts margin budgets automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/20 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-3">
              Workflow
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              From Job Posting to Ready PDF in 3 Steps
            </h2>
            <p className="mt-3 text-muted-foreground">
              A frictionless workflow designed to help you apply with confidence in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="rounded-xl border border-border/70 bg-card p-6 relative flex flex-col">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Build Your Knowledge Base</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Import your existing resume or type in your verified work experiences, skills, and projects once. This acts as your single source of truth.
              </p>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs font-semibold text-primary">
                One-time 5-minute setup →
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border/70 bg-card p-6 relative flex flex-col">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Paste Job Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Paste the text or URL of the job you want. LatexAI parses key requirements, seniority keywords, and required technical credentials.
              </p>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs font-semibold text-primary">
                Automated extraction →
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border/70 bg-card p-6 relative flex flex-col">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Compile & Download</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                The engine matches your experiences to the JD, generates optimized bullets, compiles with pdflatex, and returns your publication-grade PDF.
              </p>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs font-semibold text-primary">
                Instant PDF & .tex source →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LaTeX Templates Section */}
      <section id="templates" className="py-20 lg:py-28 bg-background border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-3">
              Curated LaTeX Styles
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Single-Column, ATS-Compliant Templates
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every template is tested against Taleo, Workday, Greenhouse, and Lever parsers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                className={`cursor-pointer transition-all border-2 ${
                  selectedTemplate === tpl.id ? 'border-primary shadow-md' : 'border-border/60 hover:border-border'
                }`}
                onClick={() => setSelectedTemplate(tpl.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {tpl.tag}
                    </Badge>
                    <Badge variant="success" className="text-xs">
                      {tpl.ats}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{tpl.name}</CardTitle>
                  <CardDescription className="text-xs">{tpl.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md bg-muted/50 p-3 text-[11px] font-mono border border-border/50 space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-sans">Font: {tpl.font}</span>
                    {tpl.previewLines.map((line, idx) => (
                      <p key={idx} className="truncate text-foreground/80">
                        {line}
                      </p>
                    ))}
                  </div>

                  <Button
                    variant={selectedTemplate === tpl.id ? 'default' : 'outline'}
                    size="sm"
                    className="w-full text-xs"
                    asChild
                  >
                    <Link to="/register">Use This Template</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: ATS Simulator */}
      <section id="ats-scorer" className="py-20 bg-muted/20 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Why Generic Resumes Fail ATS Checks
            </h2>
            <p className="mt-3 text-muted-foreground">
              Compare a typical graphic resume with LatexAI's structured single-column pdflatex output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* The Old Way */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-destructive/20 pb-3">
                <span className="font-bold text-destructive flex items-center gap-1.5 text-sm">
                  <X className="h-4 w-4" /> Word / Canva Multi-Column
                </span>
                <Badge variant="destructive" className="text-xs">
                  52% ATS Score
                </Badge>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>Two-column tables cause parsers to merge left and right text randomly</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>Hidden text boxes and graphic skill-meter icons are invisible to ATS</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>Generic phrasing misses job-specific technical keywords</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>Spills onto page 2 by 4 lines, violating screening guidelines</span>
                </li>
              </ul>
            </div>

            {/* The LatexAI Way */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                  <Check className="h-4 w-4" /> LatexAI Pure pdflatex
                </span>
                <Badge variant="success" className="text-xs">
                  98% ATS Score
                </Badge>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Single-column, linear reading order ensures 100% parse accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Pure ASCII/UTF-8 LaTeX character encoding without embedded vector junk</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Deterministic keyword coverage mapped directly to job specifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Automated 1-page budget compiler guarantees zero accidental spillover</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-28 bg-background border-t border-border/60">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about the compilation pipeline and ATS compliance.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border/70 bg-card overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-semibold text-foreground text-sm sm:text-base hover:bg-muted/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* High-conversion Bottom CTA */}
      <section className="py-20 border-t border-border/60 bg-gradient-to-b from-card to-background text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Land your next interview with publication-grade LaTeX.
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Join thousands of software engineers, AI researchers, and engineering leaders who tailor resumes in under 60 seconds.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2 text-base h-12 px-8 shadow-lg shadow-primary/20">
              <Link to="/register">
                Start Tailoring Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base h-12 px-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
