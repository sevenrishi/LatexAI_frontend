import { AccountDetailsSection } from '@/features/settings/components/AccountDetailsSection'
import { AppearanceSection } from '@/features/settings/components/AppearanceSection'
import { SecurityPasswordSection } from '@/features/settings/components/SecurityPasswordSection'
import { DataExportSection } from '@/features/settings/components/DataExportSection'
import { DangerZoneSection } from '@/features/settings/components/DangerZoneSection'

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
    </div>
  )
}

export default SettingsPage
