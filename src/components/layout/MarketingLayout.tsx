import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NetworkBanner } from '@/components/common/NetworkBanner'
import { useAuthStore } from '@/store/authStore'
import { Sparkles, ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react'

export function MarketingLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  const navLinks = [
    { label: 'Features', href: '/#features', isInternal: false },
    { label: 'How It Works', href: '/#how-it-works', isInternal: false },
    { label: 'Templates', href: '/#templates', isInternal: false },
    { label: 'ATS Scorer', href: '/#ats-scorer', isInternal: false },
    { label: 'Help & FAQ', href: '/help', isInternal: true },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Skip to Main Content Link for A11y (FE-7.02) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <NetworkBanner />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Latex<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) =>
              link.isInternal ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button size="sm" asChild className="gap-1.5 shadow-sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="gap-1.5 shadow-sm">
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background/95 px-4 pt-2 pb-6 backdrop-blur-lg sm:hidden">
            <nav className="flex flex-col space-y-3 pt-2 pb-4">
              {navLinks.map((link) =>
                link.isInternal ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {user ? (
                <Button asChild className="w-full justify-center gap-1.5">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full justify-center">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-center gap-1.5">
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      {/* Rich Footer */}
      <footer className="border-t border-border bg-card/60 py-16 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Col 1: Brand Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xl font-black tracking-tight text-foreground">
                  Latex<span className="text-primary">AI</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                The zero-hallucination AI resume compiler. Pair verified career profiles with job descriptions to produce deterministic ATS matches and publication-grade LaTeX resumes.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-foreground">All systems operational</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="/#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="/#templates" className="hover:text-foreground transition-colors">LaTeX Templates</a></li>
                <li><a href="/#ats-scorer" className="hover:text-foreground transition-colors">ATS Scoring Engine</a></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help & FAQ</Link></li>
              </ul>
            </div>

            {/* Col 3: Templates */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Templates</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="/#templates" className="hover:text-foreground transition-colors">Software Engineer Modern</a></li>
                <li><a href="/#templates" className="hover:text-foreground transition-colors">Minimal Academic</a></li>
                <li><a href="/#templates" className="hover:text-foreground transition-colors">Executive Clean</a></li>
                <li><a href="/#templates" className="hover:text-foreground transition-colors">Single-Column Standard</a></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Overleaf Integration Guide</Link></li>
              </ul>
            </div>

            {/* Col 4: Trust & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Trust & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center & Docs</Link></li>
                <li><Link to="/privacy#security" className="hover:text-foreground transition-colors">Security Architecture</Link></li>
                <li><Link to="/privacy#retention" className="hover:text-foreground transition-colors">Data Retention</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} LatexAI Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
