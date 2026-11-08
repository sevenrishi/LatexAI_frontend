import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NetworkBanner } from '@/components/common/NetworkBanner'
import { Sparkles, ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground">
      <NetworkBanner />
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-10 z-10">
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">Latex<span className="text-primary">AI</span></span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Center Auth Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <Outlet />

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-bit SSL encrypted • Zero hallucination guarantee</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Help</a>
        </div>
      </footer>
    </div>
  )
}
