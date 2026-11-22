import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NetworkBanner } from '@/components/common/NetworkBanner'
import { ShieldCheck } from 'lucide-react'
import { KolomlyLogo } from '@/components/brand'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground">
      <NetworkBanner />
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-10 z-10">
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">

          <KolomlyLogo width={120} height={45} />
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
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
        </div>
      </footer>
    </div>
  )
}
