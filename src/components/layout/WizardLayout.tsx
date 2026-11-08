import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NetworkBanner } from '@/components/common/NetworkBanner'
import { Button } from '@/components/ui/button'
import { Sparkles, X } from 'lucide-react'

export function WizardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NetworkBanner />
      {/* Wizard Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight">Latex<span className="text-primary">AI</span></span>
          <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Setup Wizard</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Link to="/dashboard">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Save & Exit</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Wizard Body */}
      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
