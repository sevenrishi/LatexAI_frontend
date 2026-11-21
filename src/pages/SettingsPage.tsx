import { Link } from 'react-router-dom'
import { AccountDetailsSection } from '@/features/settings/components/AccountDetailsSection'
import { AppearanceSection } from '@/features/settings/components/AppearanceSection'
import { SecurityPasswordSection } from '@/features/settings/components/SecurityPasswordSection'
import { DataExportSection } from '@/features/settings/components/DataExportSection'
import { DangerZoneSection } from '@/features/settings/components/DangerZoneSection'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Scale, HelpCircle } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300" data-testid="settings-page">
      {/* Header */}
      <div className="pb-2 border-b border-border/60">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account profile, theme preferences, password security, and data privacy.
        </p>
      </div>

      {/* 1. Account Details */}
      <AccountDetailsSection />

      {/* 2. Appearance & Theme */}
      <AppearanceSection />

      {/* 3. Security & Password */}
      <SecurityPasswordSection />

      {/* 4. Data Privacy & Portability */}
      <DataExportSection />

      {/* 5. Danger Zone */}
      <DangerZoneSection />

      {/* 6. Legal & Support Links */}
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Legal & Help Resources</h3>
              <p className="text-xs text-muted-foreground">
                Review our zero-training privacy policy, compiler terms of service, and documentation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Link
                to="/privacy"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Privacy Policy
              </Link>
              <span className="text-border">•</span>
              <Link
                to="/terms"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Scale className="h-3.5 w-3.5 text-primary" />
                Terms of Service
              </Link>
              <span className="text-border">•</span>
              <Link
                to="/help"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                Help Center
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
