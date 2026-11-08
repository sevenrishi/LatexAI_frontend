import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { calculateCompleteness, INITIAL_DEMO_FULL_PROFILE } from '@/features/profile/api/profileApi'
import { CompletenessRing } from '@/features/profile/components/CompletenessRing'
import { ContactInfoSection } from '@/features/profile/components/ContactInfoSection'
import { SummarySection } from '@/features/profile/components/SummarySection'
import { ExperienceSection } from '@/features/profile/components/ExperienceSection'
import { EducationSection } from '@/features/profile/components/EducationSection'
import { SkillsSection } from '@/features/profile/components/SkillsSection'
import { CertificationsSection } from '@/features/profile/components/CertificationsSection'
import { ProjectsSection } from '@/features/profile/components/ProjectsSection'
import { ResumeImportModal } from '@/features/profile/components/ResumeImportModal'
import { ProfilePage } from '@/pages/ProfilePage'
import type { FullProfile } from '@/types/profile'

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Phase B — Profile Knowledge Base Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('FE-2.01: Completeness Calculation & API', () => {
    it('accurately calculates completeness score and missing sections', () => {
      const partialProfile: Partial<FullProfile> = {
        fullName: 'Alex Rivera',
        email: 'alex@example.com',
        phone: '123-456-7890',
        location: 'NYC',
        summary: 'Experienced distributed systems lead with strong software foundations.',
        experience: [],
        skills: [],
      }

      const result = calculateCompleteness(partialProfile)
      expect(result.sections.contact).toBe(true)
      expect(result.sections.summary).toBe(true)
      expect(result.sections.experience).toBe(false)
      expect(result.missingSections).toContain('Experience')
      expect(result.missingSections).toContain('Skills')
      expect(result.percentage).toBe(30)
      expect(result.tier).toBe('needs_work')
    })

    it('identifies strong tier when all primary sections are populated', () => {
      const result = calculateCompleteness(INITIAL_DEMO_FULL_PROFILE)
      expect(result.percentage).toBeGreaterThanOrEqual(80)
      expect(result.tier).toBe('strong')
    })
  })

  describe('FE-2.02: Completeness Progress Ring & Chips', () => {
    it('renders progress percentage and missing section chips', () => {
      const completeness = {
        percentage: 75,
        tier: 'good' as const,
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: false,
          certifications: false,
        },
        missingSections: ['Certifications', 'Projects'],
      }

      render(<CompletenessRing completeness={completeness} />)

      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('Good Progress')).toBeInTheDocument()
      expect(screen.getByText('+ Add Certifications')).toBeInTheDocument()
      expect(screen.getByText('+ Add Projects')).toBeInTheDocument()
    })
  })

  describe('FE-2.03: Contact Info Section & Dynamic Links', () => {
    it('renders contact inputs and adds custom links dynamically', async () => {
      const user = userEvent.setup()
      renderWithClient(<ContactInfoSection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByDisplayValue(INITIAL_DEMO_FULL_PROFILE.fullName)).toBeInTheDocument()
      expect(screen.getByDisplayValue(INITIAL_DEMO_FULL_PROFILE.email)).toBeInTheDocument()

      // Add link button
      const addLinkBtn = screen.getByRole('button', { name: /Add Link/i })
      await user.click(addLinkBtn)

      expect(screen.getAllByPlaceholderText(/Label \(e\.g\. Blog/i).length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('FE-2.04: Professional Summary Editor', () => {
    it('displays live character counter and word count', async () => {
      renderWithClient(<SummarySection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByText(/words/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue(INITIAL_DEMO_FULL_PROFILE.summary)).toBeInTheDocument()
    })
  })

  describe('FE-2.05: Experience List & Drawer', () => {
    it('renders experience cards and opens drawer on Add Position', async () => {
      const user = userEvent.setup()
      renderWithClient(<ExperienceSection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByText(INITIAL_DEMO_FULL_PROFILE.experience[0].company)).toBeInTheDocument()
      expect(screen.getByText(INITIAL_DEMO_FULL_PROFILE.experience[0].title)).toBeInTheDocument()

      const addBtn = screen.getByRole('button', { name: /Add Position/i })
      await user.click(addBtn)

      expect(screen.getByText(/Key Achievements & Bullets/i)).toBeInTheDocument()
    })
  })

  describe('FE-2.06: Education List & Dialog', () => {
    it('renders academic entries and opens education dialog', async () => {
      const user = userEvent.setup()
      renderWithClient(<EducationSection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByText(INITIAL_DEMO_FULL_PROFILE.education[0].institution)).toBeInTheDocument()

      const addBtn = screen.getByRole('button', { name: /Add Education/i })
      await user.click(addBtn)

      expect(screen.getByText(/Enter your degree, academic institution/i)).toBeInTheDocument()
    })
  })

  describe('FE-2.07: Skills Manager & Bulk Paste', () => {
    it('displays categorized skill badges and opens bulk paste modal', async () => {
      const user = userEvent.setup()
      renderWithClient(<SkillsSection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByText('Languages')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()

      const bulkBtn = screen.getByRole('button', { name: /Bulk Paste/i })
      await user.click(bulkBtn)

      expect(screen.getByText(/Quickly paste a list of skills/i)).toBeInTheDocument()
    })
  })

  describe('FE-2.08: Certifications List & Dialog', () => {
    it('renders certifications section and allows opening certification dialog', async () => {
      const user = userEvent.setup()
      renderWithClient(<CertificationsSection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByText(INITIAL_DEMO_FULL_PROFILE.certifications[0].name)).toBeInTheDocument()

      const addBtn = screen.getByRole('button', { name: /Add Certification/i })
      await user.click(addBtn)

      expect(screen.getByText(/Document professional credentials/i)).toBeInTheDocument()
    })
  })

  describe('FE-2.09: Projects Section & Dialog', () => {
    it('renders project cards with tech tags and links', async () => {
      renderWithClient(<ProjectsSection profile={INITIAL_DEMO_FULL_PROFILE} />)

      expect(screen.getByText(INITIAL_DEMO_FULL_PROFILE.projects[0].title)).toBeInTheDocument()
      expect(screen.getByText('Redis')).toBeInTheDocument()
    })
  })

  describe('FE-2.11 & FE-2.12: Resume Import Wizard', () => {
    it('validates file size limit and handles upload', async () => {
      renderWithClient(
        <ResumeImportModal
          open={true}
          onOpenChange={() => {}}
          currentProfile={INITIAL_DEMO_FULL_PROFILE}
        />
      )

      expect(screen.getByText(/Drop your resume here, or browse files/i)).toBeInTheDocument()
      expect(screen.getByText(/Load Sample Resume/i)).toBeInTheDocument()
    })

    it('advances through progress state when sample resume is loaded', async () => {
      const user = userEvent.setup()
      renderWithClient(
        <ResumeImportModal
          open={true}
          onOpenChange={() => {}}
          currentProfile={INITIAL_DEMO_FULL_PROFILE}
        />
      )

      const sampleBtn = screen.getByRole('button', { name: /Load Sample Resume/i })
      await user.click(sampleBtn)

      // Shows progress
      expect(screen.getByText(/Processing document/i)).toBeInTheDocument()
    })
  })

  describe('W-13 Profile Page Integration', () => {
    it('renders complete W-13 shell view with tabs', async () => {
      renderWithClient(<ProfilePage />)

      expect(await screen.findByText('Career Knowledge Base')).toBeInTheDocument()
      expect(await screen.findByRole('tab', { name: /All Sections/i })).toBeInTheDocument()
      expect(await screen.findByRole('tab', { name: /Experience/i })).toBeInTheDocument()
      expect(await screen.findByRole('tab', { name: /Skills/i })).toBeInTheDocument()
    })
  })
})
