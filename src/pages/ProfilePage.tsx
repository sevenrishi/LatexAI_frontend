import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { CompletenessRing } from '@/features/profile/components/CompletenessRing'
import { ContactInfoSection } from '@/features/profile/components/ContactInfoSection'
import { SummarySection } from '@/features/profile/components/SummarySection'
import { ExperienceSection } from '@/features/profile/components/ExperienceSection'
import { EducationSection } from '@/features/profile/components/EducationSection'
import { SkillsSection } from '@/features/profile/components/SkillsSection'
import { CertificationsSection } from '@/features/profile/components/CertificationsSection'
import { ProjectsSection } from '@/features/profile/components/ProjectsSection'
import { ResumeImportModal } from '@/features/profile/components/ResumeImportModal'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import {
  Upload,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  FolderGit2,
  Layers,
  Loader2,
} from 'lucide-react'

export function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile()
  const [activeTab, setActiveTab] = useState('all')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [hasDirtyForm, setHasDirtyForm] = useState(false)

  // Unsaved changes navigation guard
  const { showPrompt, confirmNavigation, cancelNavigation } = useUnsavedChangesGuard({
    isDirty: hasDirtyForm,
    message: 'You have unsaved changes in your profile. Are you sure you want to leave without saving?',
  })

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setHasDirtyForm(isDirty)
  }, [])

  const handleSelectSection = (sectionId: string) => {
    if (activeTab !== 'all' && activeTab !== sectionId) {
      setActiveTab(sectionId)
    }
    // Smooth scroll to the target element if on 'all'
    const el = document.getElementById(`section-${sectionId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading career knowledge base...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <h3 className="text-lg font-semibold text-destructive">Failed to load profile</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error?.message || 'Please refresh the page to retry.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Career Knowledge Base
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              W-13
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            This is your verified career ground truth. Our AI compiler synthesizes ATS-optimized resumes exclusively from facts stored here.
          </p>
        </div>

        <Button onClick={() => setImportModalOpen(true)} className="gap-2 shadow-xs">
          <Upload className="h-4 w-4" />
          Import from Resume (PDF/DOCX)
        </Button>
      </div>

      {/* Profile Completeness Ring & Missing Section Chips */}
      <CompletenessRing
        completeness={profile.completeness}
        onSelectSection={handleSelectSection}
      />

      {/* Section Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-10 w-max sm:w-full justify-start p-1 bg-muted/50 border border-border">
            <TabsTrigger value="all" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" />
              All Sections
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-1.5 text-xs">
              <Briefcase className="h-3.5 w-3.5" />
              Experience ({profile.experience?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Skills ({profile.skills?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-1.5 text-xs">
              <GraduationCap className="h-3.5 w-3.5" />
              Education ({profile.education?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-1.5 text-xs">
              <Award className="h-3.5 w-3.5" />
              Certifications ({profile.certifications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5 text-xs">
              <FolderGit2 className="h-3.5 w-3.5" />
              Projects ({profile.projects?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: All Sections */}
        <TabsContent value="all" className="space-y-6 mt-0">
          <div id="section-contact">
            <ContactInfoSection profile={profile} onDirtyChange={handleDirtyChange} />
          </div>
          <div id="section-summary">
            <SummarySection profile={profile} onDirtyChange={handleDirtyChange} />
          </div>
          <div id="section-experience">
            <ExperienceSection profile={profile} />
          </div>
          <div id="section-skills">
            <SkillsSection profile={profile} />
          </div>
          <div id="section-education">
            <EducationSection profile={profile} />
          </div>
          <div id="section-certifications">
            <CertificationsSection profile={profile} />
          </div>
          <div id="section-projects">
            <ProjectsSection profile={profile} />
          </div>
        </TabsContent>

        {/* Individual Tab Views */}
        <TabsContent value="contact" className="mt-0">
          <ContactInfoSection profile={profile} onDirtyChange={handleDirtyChange} />
        </TabsContent>

        <TabsContent value="summary" className="mt-0">
          <SummarySection profile={profile} onDirtyChange={handleDirtyChange} />
        </TabsContent>

        <TabsContent value="experience" className="mt-0">
          <ExperienceSection profile={profile} />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillsSection profile={profile} />
        </TabsContent>

        <TabsContent value="education" className="mt-0">
          <EducationSection profile={profile} />
        </TabsContent>

        <TabsContent value="certifications" className="mt-0">
          <CertificationsSection profile={profile} />
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <ProjectsSection profile={profile} />
        </TabsContent>
      </Tabs>

      {/* Resume Import Wizard Dialog */}
      <ResumeImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        currentProfile={profile}
      />

      {/* Unsaved Changes Route Blocker Modal */}
      <ConfirmDialog
        open={showPrompt}
        onOpenChange={(open) => !open && cancelNavigation()}
        title="Unsaved Changes"
        description="You have unsaved changes in your profile. Leaving this page will discard any modifications you've made. Are you sure you want to leave?"
        confirmText="Leave without Saving"
        cancelText="Stay on Page"
        variant="destructive"
        onConfirm={confirmNavigation}
      />
    </div>
  )
}

export default ProfilePage
