import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  BookOpen,
  Sparkles,
  FileCode2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Mail,
  Zap,
  Terminal,
  FileText,
  LayoutDashboard,
  Copy,
  Check,
  X,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const FAQS: FAQItem[] = [
  {
    id: 'zero-hallucination',
    category: 'ai',
    question: 'How does Kolomly guarantee zero AI hallucinations?',
    answer:
      'Unlike generic chatbots that make up past jobs or fake metrics when prompted, Kolomly uses strict fact-anchoring. All resume tailoring draws exclusively from verified entries stored in your Profile Knowledge Base. If a target job description requires Kubernetes experience and it does not exist in your Profile KB, Kolomly will highlight it as an ATS missing skill rather than fabricating a false work history.',
    tags: ['ai', 'hallucination', 'profile', 'trust', 'accuracy'],
  },
  {
    id: 'why-latex',
    category: 'latex',
    question: 'Why is LaTeX better than Word or Canva for ATS parsers?',
    answer:
      'Canva and graphical editors render resumes as image layers, floating bounding boxes, or complex SVG paths that confuse Applicant Tracking Systems (ATS) like Workday and Greenhouse. Word documents frequently break formatting across different OS platforms. LaTeX compiles into pure, deterministic vector PDFs with standard structural tags, flawless typographical kerning, and crisp text streams that ATS parsers extract with near-100% accuracy.',
    tags: ['latex', 'ats', 'canva', 'word', 'formatting'],
  },
  {
    id: 'fix-compile-error',
    category: 'troubleshooting',
    question: 'What do I do if I get a "LaTeX Compilation Failed" error?',
    answer:
      '95% of LaTeX compile failures are caused by unescaped special characters in raw text. In LaTeX: % is a comment (use \\%), & is a column separator (use \\&), _ is math subscript (use \\_), and $ starts math mode (use \\$). Also check that every \\begin{itemize} has a matching \\end{itemize}. You can view the compiler log directly in the Template Editor or click "Auto-Fix TeX Syntax" in the Review step.',
    tags: ['latex', 'error', 'compilation', 'syntax', 'special characters', 'debug'],
  },
  {
    id: 'fit-one-page',
    category: 'latex',
    question: 'How do I force my resume to fit on exactly one page?',
    answer:
      'To prevent an unwanted second page with 2 stray lines: 1) In the Template Editor, adjust the geometry package margins (e.g. \\geometry{left=0.5in,top=0.4in,right=0.5in,bottom=0.4in}); 2) Reduce list item spacing by adding \\vspace{-2pt} between sections or setting \\itemsep -2pt in your itemize blocks; 3) Limit your job bullet counts to the 3-4 highest-impact achievements matching the target job description.',
    tags: ['one page', 'margins', 'geometry', 'overflow', 'spacing', 'length'],
  },
  {
    id: 'overleaf-export',
    category: 'latex',
    question: 'Can I export the raw .tex source code to Overleaf or TeXShop?',
    answer:
      'Yes! On the Review and PDF Preview pages, click the "Download .tex" button. You can open this file in any local TeX editor (such as MacTeX, TeX Live, or MiKTeX) or upload it directly into Overleaf to make custom manual typesetting tweaks.',
    tags: ['overleaf', 'tex', 'export', 'download', 'source code'],
  },
  {
    id: 'ai-training-privacy',
    category: 'privacy',
    question: 'Is my resume or career history used to train public AI models?',
    answer:
      'Strictly NO. Under our enterprise sub-processor agreements, your career records, uploaded documents, and generated bullet points are processed through zero-data-retention APIs and are never used to train, evaluate, or fine-tune public LLMs (including models from OpenAI, Anthropic, or Google). You retain 100% copyright and ownership over your data.',
    tags: ['privacy', 'training', 'data', 'security', 'gdpr', 'confidentiality'],
  },
  {
    id: 'ats-match-score',
    category: 'ats',
    question: 'How is the ATS Match Score calculated?',
    answer:
      'Our ATS scoring engine performs a multi-dimensional semantic comparison between your resume and the target job description: 1) Hard Skill Keyword Coverage (languages, tools, frameworks); 2) Quantifiable Impact Score (percentage of bullet points containing metrics, KPIs, or STAR methodology); 3) Formatting Compliance (single-column parsing, standard section headers, font safety); and 4) Experience Level Alignment.',
    tags: ['ats', 'score', 'match', 'keywords', 'star', 'metrics'],
  },
  {
    id: 'import-existing-resume',
    category: 'getting-started',
    question: 'How do I import my existing resume into Kolomly?',
    answer:
      'During Onboarding or inside the Profile KB page (/profile), you can click "Import Resume (PDF/Word)". Our parser extracts your work history, education, and skills into structured editable cards. You can review and verify each fact before generating tailored resumes.',
    tags: ['import', 'pdf', 'word', 'profile', 'onboarding', 'upload'],
  },
  {
    id: 'multiple-versions',
    category: 'getting-started',
    question: 'Can I create and manage multiple versions for different roles?',
    answer:
      'Yes! Your Profile Knowledge Base acts as a comprehensive master repository containing all your experiences. When tailoring for different positions (e.g. Senior Frontend vs. Fullstack Lead), you generate distinct tailored resumes saved in your History dashboard (/history), each compiled against that role’s job description.',
    tags: ['versions', 'history', 'roles', 'tailoring', 'management'],
  },
  {
    id: 'custom-fonts-colors',
    category: 'latex',
    question: 'Can I customize colors, fonts, and section ordering in templates?',
    answer:
      'Yes. In the Template Editor (/templates/:id), you have full source code access. You can define custom hex accent colors (e.g. \\definecolor{accent}{HTML}{2563EB}), switch font packages (Charter, Computer Modern, Helvetica), and reorder sections simply by moving the TeX markup blocks.',
    tags: ['customization', 'fonts', 'colors', 'styling', 'templates'],
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: BookOpen },
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'ai', label: 'AI & Zero Hallucination', icon: Sparkles },
  { id: 'latex', label: 'LaTeX & Templates', icon: FileCode2 },
  { id: 'troubleshooting', label: 'Troubleshooting & Errors', icon: AlertTriangle },
  { id: 'ats', label: 'ATS Optimization', icon: ShieldCheck },
  { id: 'privacy', label: 'Privacy & Security', icon: FileText },
]

const LATEX_ESCAPE_CHEAT_SHEET = [
  { char: '%', name: 'Percent sign', escape: '\\%', note: 'Unescaped % treats everything after it as a comment!' },
  { char: '&', name: 'Ampersand', escape: '\\&', note: 'Used as column separator in tables and tabular blocks.' },
  { char: '_', name: 'Underscore', escape: '\\_', note: 'Used for subscript in LaTeX math mode (e.g. text\\_var).' },
  { char: '$', name: 'Dollar sign', escape: '\\$', note: 'Starts and ends inline math formulas.' },
  { char: '#', name: 'Hash / Pound', escape: '\\#', note: 'Used for macro parameter definitions.' },
  { char: '~', name: 'Tilde', escape: '\\textasciitilde{}', note: 'Unescaped ~ renders as an unbreakable space.' },
]

export function HelpPage() {
  const user = useAuthStore((s) => s.user)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({
    'zero-hallucination': true,
  })
  const [copiedChar, setCopiedChar] = useState<string | null>(null)
  const faqSectionRef = useRef<HTMLDivElement>(null)

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FAQS.length }
    for (const faq of FAQS) {
      counts[faq.category] = (counts[faq.category] || 0) + 1
    }
    return counts
  }, [])

  // Filter FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      if (!query) return matchesCategory

      const matchesQuery =
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some((t) => t.includes(query))

      return matchesCategory && matchesQuery
    })
  }, [searchQuery, selectedCategory])

  // Handle search pill click: switches category to 'all' and sets query
  const handlePopularSearch = (tag: string) => {
    setSelectedCategory('all')
    setSearchQuery(tag)
    if (faqSectionRef.current) {
      const yOffset = -100
      const y = faqSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Handle resetting search and category
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  // Toggle single FAQ
  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Expand / Collapse all visible FAQs
  const handleToggleAll = (expand: boolean) => {
    const nextState: Record<string, boolean> = {}
    for (const faq of filteredFaqs) {
      nextState[faq.id] = expand
    }
    setExpandedFaqs(nextState)
  }

  // Copy helper with robust fallback
  const handleCopy = (escapeStr: string, char: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(escapeStr)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = escapeStr
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      setCopiedChar(char)
      toast.success(`Copied "${escapeStr}" to clipboard!`)
      setTimeout(() => setCopiedChar(null), 2200)
    } catch {
      toast.error('Failed to copy. Please copy manually.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-card to-background py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            How can we help you today?
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            Search our guides, learn how to tailor resumes with zero hallucinations,
            or fix LaTeX compilation syntax in seconds.
          </p>

          {/* Interactive Search Bar */}
          <div className="relative mx-auto max-w-2xl pt-2">
            <Search className="absolute left-4 top-4 sm:top-5 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search guides (e.g., 'compile error', 'one page', 'ATS score', 'Overleaf')..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (selectedCategory !== 'all') {
                  setSelectedCategory('all')
                }
              }}
              className="h-13 sm:h-14 rounded-2xl pl-12 pr-10 text-sm sm:text-base shadow-lg border-primary/20 focus-visible:ring-primary bg-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 sm:top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Popular searches pill row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <span className="font-medium">Popular searches:</span>
            {['compilation error', 'fit one page', 'zero hallucination', 'ATS keywords', 'Overleaf', 'custom fonts'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handlePopularSearch(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/80 text-foreground hover:bg-primary/20 hover:text-primary'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Category Tabs (Sticky) */}
      <section className="border-b border-border bg-card/70 py-4 sm:py-5 sticky top-16 z-20 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.id
              const count = categoryCounts[cat.id] || 0
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background/80 text-muted-foreground'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* Core Feature Workflows */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Core Guides & Workflows
              </h2>
              <p className="text-sm text-muted-foreground">
                Step-by-step guides to master the Kolomly platform
              </p>
            </div>
            {user ? (
              <Button variant="outline" size="sm" asChild className="self-start sm:self-auto gap-1.5">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild className="self-start sm:self-auto gap-1.5">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guide 1: Profile Knowledge Base */}
            <Card className="border-border/60 bg-card hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-1.5 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">1. Profile Knowledge Base</CardTitle>
                <CardDescription className="text-xs">
                  Your single source of verified truth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed flex-1 flex flex-col justify-between">
                <div>
                  <p className="mb-2">
                    Store all your historical projects, job responsibilities, exact metrics, and skills in one structured repository. The AI only reformulates what you put here.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Import your initial PDF or Word resume</li>
                    <li>Add quantifiable achievements (e.g. &ldquo;cut latency 42%&rdquo;)</li>
                    <li>Tag skills to trigger automated ATS detection</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border/40">
                  <Button variant="link" asChild className="p-0 h-auto text-xs text-primary font-semibold gap-1">
                    <Link to="/profile">
                      Open Profile KB
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guide 2: Job Description Tailoring */}
            <Card className="border-border/60 bg-card hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-1.5 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">2. Job Description Tailoring</CardTitle>
                <CardDescription className="text-xs">
                  Targeted keyword alignment without fluff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed flex-1 flex flex-col justify-between">
                <div>
                  <p className="mb-2">
                    Paste any job listing into the generator. Our algorithm parses the requirements, identifies high-frequency skills, and matches them against your profile.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Automatic extraction of core requirements</li>
                    <li>Rewriting bullets using the STAR method</li>
                    <li>Instant ATS compatibility score breakdown</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border/40">
                  <Button variant="link" asChild className="p-0 h-auto text-xs text-emerald-600 dark:text-emerald-400 font-semibold gap-1">
                    <Link to="/generate">
                      Tailor a Resume
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guide 3: LaTeX Templates & Overleaf */}
            <Card className="border-border/60 bg-card hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-1.5 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-1">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">3. LaTeX Templates & Export</CardTitle>
                <CardDescription className="text-xs">
                  Publication-quality typography & source code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed flex-1 flex flex-col justify-between">
                <div>
                  <p className="mb-2">
                    Choose from battle-tested ATS single-column templates or modern academic styles. Tweak formatting in our split-view editor or export raw TeX.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Real-time server-side pdflatex preview</li>
                    <li>Download 300+ DPI vector PDFs</li>
                    <li>Download raw <code className="font-mono text-[11px]">.tex</code> for Overleaf</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border/40">
                  <Button variant="link" asChild className="p-0 h-auto text-xs text-purple-600 dark:text-purple-400 font-semibold gap-1">
                    <Link to="/templates">
                      Browse Templates
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* LaTeX Syntax & Compilation Cheat Sheet */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                LaTeX Quick Syntax & Special Characters Cheat Sheet
              </h2>
              <p className="text-xs text-muted-foreground">
                In LaTeX, certain symbols are reserved compiler tokens. Click copy to grab the correct escaped code:
              </p>
            </div>
          </div>

          <Card className="border-border/60 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-semibold text-foreground">
                  <tr>
                    <th className="p-3 w-16 text-center">Character</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Required Escape Code</th>
                    <th className="p-3">Why it matters</th>
                    <th className="p-3 w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  {LATEX_ESCAPE_CHEAT_SHEET.map((row) => (
                    <tr key={row.char} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-center text-foreground text-sm">{row.char}</td>
                      <td className="p-3 font-medium text-foreground">{row.name}</td>
                      <td className="p-3 font-mono font-semibold text-primary">{row.escape}</td>
                      <td className="p-3 text-xs">{row.note}</td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(row.escape, row.char)}
                          className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary"
                        >
                          {copiedChar === row.char ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQs Accordion */}
        <div ref={faqSectionRef} className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                Frequently Asked Questions
                <Badge variant="secondary" className="text-xs font-mono ml-1">
                  {filteredFaqs.length}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {searchQuery
                  ? `Showing results matching "${searchQuery}"`
                  : selectedCategory === 'all'
                    ? 'All platform guides, troubleshooting, and optimization tips'
                    : `Filtered by ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleToggleAll(true)}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleToggleAll(false)}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                Collapse All
              </Button>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 text-xs gap-1 text-primary hover:text-primary/90 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">No matching questions found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  We couldn&apos;t find an answer matching &ldquo;{searchQuery}&rdquo;. Try another term or contact our support team directly.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="gap-1.5 cursor-pointer">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear Search & Show All
                </Button>
                <Button size="sm" asChild className="gap-1.5">
                  <a href="mailto:latexai.support@sevenrishi.tech?subject=Help%20Request">
                    <Mail className="h-3.5 w-3.5" />
                    Ask Support
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = Boolean(expandedFaqs[faq.id])
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <span className="pr-4 leading-snug">{faq.question}</span>
                      <div className="rounded-full bg-muted p-1 text-muted-foreground shrink-0 transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/60 bg-muted/10 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-muted-foreground space-y-3 animate-in fade-in duration-200">
                        <p>{faq.answer}</p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Tags:</span>
                          {faq.tags.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handlePopularSearch(t)}
                              className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-foreground hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Contact Support Card */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Human Support Team
              </Badge>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Still have questions or facing a tricky LaTeX bug?
              </h3>
              <p className="text-sm text-muted-foreground">
                Our engineering team includes TeX typographers and ATS software veterans. We typically respond within 24 business hours.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 shadow-md">
                <a href="mailto:latexai.support@sevenrishi.tech?subject=Kolomly%20Support%20Request">
                  <Mail className="h-4 w-4" />
                  Email Support (latexai.support@sevenrishi.tech)
                </a>
              </Button>
              {user ? (
                <Button variant="outline" size="lg" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              <strong className="text-foreground block mb-0.5">Average Response Time</strong>
              <span>Under 24 hours (Monday &ndash; Friday)</span>
            </div>
            <div>
              <strong className="text-foreground block mb-0.5">LaTeX TeXLive Environment</strong>
              <span>TeXLive 2026 Engine with standard modern packages</span>
            </div>
            <div>
              <strong className="text-foreground block mb-0.5">Feature Requests</strong>
              <span>Submit suggestions to <a href="mailto:latexai.features@sevenrishi.tech" className="text-primary underline">latexai.features@sevenrishi.tech</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage