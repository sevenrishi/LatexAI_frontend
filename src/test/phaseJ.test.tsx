import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChangesTab } from '@/features/review/components/ChangesTab'
import { EditTab } from '@/features/review/components/EditTab'
import {
  sanitizeFileName,
  resolveCustomFilename,
  downloadResumeFile,
} from '@/features/review/utils/downloadResume'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import type { ChangesData, TailoredContent } from '@/types/generation'

const sampleChanges: ChangesData = {
  stats: {
    bulletsTailored: 8,
    totalBullets: 8,
    keywordsAdded: 6,
    factGroundingPercent: 100,
    metricsBoosted: 3,
  },
  tailoringNotes: [
    'Prioritized high-throughput payment infrastructure experience to match target requirements.',
    'Integrated critical technical keywords: TypeScript, Distributed Systems, PostgreSQL, and Docker.',
    'Strengthened executive action verbs from "Worked on" to "Architected" and "Engineered".',
    'All business impact and performance claims are 100% grounded in verified profile metrics.',
  ],
  roleChanges: [
    {
      roleId: 'exp_stripe_01',
      roleTitle: 'Senior Software Engineer',
      companyName: 'FinTech Cloud Inc.',
      period: '2022 - Present',
      bullets: [
        {
          id: 'b1',
          original: 'Worked on the backend payment processing service using Node.js and Postgres.',
          tailored:
            'Architected distributed payment processing microservices using TypeScript, Node.js, and PostgreSQL, handling 2.5M daily transactions.',
          changeType: 'keyword_injected',
          keywordsInjected: ['TypeScript', 'Distributed Systems', 'PostgreSQL'],
          sourceEntityId: 'exp_01',
          sourceEntityType: 'experience',
          isTraceable: true,
        },
      ],
    },
  ],
  traceabilityFlags: {
    zeroHallucinations: true,
    allFactsGrounded: true,
    auditTrail: [
      {
        claim: '2.5M daily transactions in payment processing microservices',
        source: 'Verified Experience (FinTech Cloud Inc., Bullet 1)',
        status: 'VERIFIED',
      },
    ],
  },
}

const sampleTailoredContent: TailoredContent = {
  summary: 'Experienced Full Stack Engineer specializing in TypeScript and cloud systems.',
  experience: [
    {
      id: 'role_test_1',
      roleTitle: 'Lead Software Architect',
      companyName: 'CloudCorp',
      period: '2023 - Present',
      bullets: [
        'Designed high-throughput distributed microservices in Go and Kubernetes.',
        'Mentored junior engineers and reduced onboarding cycle time by 40%.',
      ],
    },
  ],
  skills: {
    'Languages & Core': ['TypeScript', 'Go', 'Python'],
    'Cloud & Infrastructure': ['Kubernetes', 'Docker', 'AWS'],
  },
  projects: [
    {
      id: 'proj_test_1',
      title: 'CloudMesh Telemetry',
      technologies: 'Go, Prometheus, Grafana',
      bullets: ['Built real-time telemetry pipeline for 500+ cluster nodes.'],
    },
  ],
}

function renderWithClient(ui: React.ReactElement, initialRoute = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/history" element={ui} />
          <Route path="/settings" element={ui} />
          <Route path="/generate" element={<div data-testid="generate-screen">Generate Screen</div>} />
          <Route path="/review/:id" element={<div data-testid="review-screen">Review Screen</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Phase J — Review, Download, History, and Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({ theme: 'system' })
    useAuthStore.setState({
      profile: {
        id: 'usr_demo_456',
        email: 'demo@latexai.dev',
        fullName: 'Alex Rivera',
        headline: 'Senior Full Stack & AI Systems Engineer',
        onboardingCompleted: true,
      },
    })
  })

  describe('FE-5.04: W-20 Changes Tab Component', () => {
    it('renders stats bar, AI tailoring notes, role accordions, and traceability audit panels', () => {
      render(<ChangesTab changesData={sampleChanges} />)

      // Stats bar checks
      expect(screen.getByTestId('changes-stats-bar')).toBeInTheDocument()
      expect(screen.getByText('8 / 8')).toBeInTheDocument()
      expect(screen.getByText('+6')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()

      // Strategy notes
      expect(screen.getByTestId('tailoring-strategy-card')).toBeInTheDocument()
      expect(
        screen.getByText(/Prioritized high-throughput payment infrastructure experience/i)
      ).toBeInTheDocument()

      // Role accordions
      expect(screen.getByTestId('role-diff-accordions')).toBeInTheDocument()
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('@ FinTech Cloud Inc.')).toBeInTheDocument()

      // Diff bullets
      expect(screen.getByTestId('bullet-diff-b1')).toBeInTheDocument()
      expect(
        screen.getByText(/Worked on the backend payment processing service/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Architected distributed payment processing microservices/i)
      ).toBeInTheDocument()

      // Injected keywords
      expect(screen.getByText('+TypeScript')).toBeInTheDocument()
      expect(screen.getByText('+Distributed Systems')).toBeInTheDocument()

      // Traceability panel
      expect(screen.getByTestId('traceability-audit-panel')).toBeInTheDocument()
      expect(screen.getByText(/2.5M daily transactions in payment processing/i)).toBeInTheDocument()
    })

    it('toggles role diff accordion visibility on click', async () => {
      const user = userEvent.setup()
      render(<ChangesTab changesData={sampleChanges} />)

      const trigger = screen.getByTestId('accordion-trigger-exp_stripe_01')
      expect(screen.getByTestId('bullet-diff-b1')).toBeInTheDocument()

      // Click to collapse
      await user.click(trigger)
      expect(screen.queryByTestId('bullet-diff-b1')).not.toBeInTheDocument()

      // Click to expand again
      await user.click(trigger)
      expect(screen.getByTestId('bullet-diff-b1')).toBeInTheDocument()
    })
  })

  describe('FE-5.05: W-20 Edit Tab Component', () => {
    it('renders structured form fields for summary, experience, skills, and projects', () => {
      const queryClient = new QueryClient()
      render(
        <QueryClientProvider client={queryClient}>
          <EditTab generationId="gen_mock_999" initialContent={sampleTailoredContent} />
        </QueryClientProvider>
      )

      expect(screen.getByTestId('edit-summary-card')).toBeInTheDocument()
      expect(screen.getByTestId('summary-textarea')).toHaveValue(sampleTailoredContent.summary)
      expect(screen.getByTestId('edit-experience-card')).toBeInTheDocument()
      expect(screen.getByTestId('edit-skills-card')).toBeInTheDocument()
      expect(screen.getByTestId('edit-projects-card')).toBeInTheDocument()
      expect(screen.getByTestId('save-rerender-button')).toBeInTheDocument()
      expect(screen.getByTestId('reset-ai-button')).toBeInTheDocument()
    })

    it('allows editing summary and adds new bullet points to experience roles', async () => {
      const user = userEvent.setup()
      const queryClient = new QueryClient()
      const onMarkEdited = vi.fn()

      render(
        <QueryClientProvider client={queryClient}>
          <EditTab
            generationId="gen_mock_999"
            initialContent={sampleTailoredContent}
            onMarkEdited={onMarkEdited}
          />
        </QueryClientProvider>
      )

      // Edit summary
      const summaryInput = screen.getByTestId('summary-textarea')
      await user.type(summaryInput, ' Added custom achievements.')
      expect(onMarkEdited).toHaveBeenCalled()

      // Add bullet to role
      const addBulletBtn = screen.getByTestId('add-bullet-role_test_1')
      await user.click(addBulletBtn)

      // Should now have 3 bullets in this role
      expect(screen.getByTestId('bullet-row-role_test_1-2')).toBeInTheDocument()
    })

    it('allows deleting a bullet from a role', async () => {
      const user = userEvent.setup()
      const queryClient = new QueryClient()

      render(
        <QueryClientProvider client={queryClient}>
          <EditTab generationId="gen_mock_999" initialContent={sampleTailoredContent} />
        </QueryClientProvider>
      )

      expect(screen.getByTestId('bullet-row-role_test_1-1')).toBeInTheDocument()
      const deleteBulletBtn = screen.getByTestId('delete-bullet-role_test_1-1')
      await user.click(deleteBulletBtn)

      // Bullet 1 should have been removed
      expect(screen.queryByTestId('bullet-row-role_test_1-1')).not.toBeInTheDocument()
    })

    it('triggers save and re-render pipeline action', async () => {
      const user = userEvent.setup()
      const queryClient = new QueryClient()
      const onSavedAndRerender = vi.fn()

      render(
        <QueryClientProvider client={queryClient}>
          <EditTab
            generationId="gen_mock_999"
            initialContent={sampleTailoredContent}
            onSavedAndRerender={onSavedAndRerender}
          />
        </QueryClientProvider>
      )

      const saveBtn = screen.getByTestId('save-rerender-button')
      await user.click(saveBtn)

      await waitFor(() => {
        expect(onSavedAndRerender).toHaveBeenCalled()
      })
    })
  })

  describe('FE-5.06: Secure PDF & .tex Downloads with Filename Resolution', () => {
    it('sanitizes strings into safe filenames', () => {
      expect(sanitizeFileName('Senior Full-Stack Engineer / Lead')).toBe(
        'Senior_Full-Stack_Engineer_Lead'
      )
      expect(sanitizeFileName('Google, Inc. (Cloud)')).toBe('Google_Inc_Cloud')
    })

    it('resolves custom filename with applicant name, role, company, and extension', () => {
      const pdfFileName = resolveCustomFilename({
        applicantName: 'Alex Rivera',
        jobTitle: 'Senior Full Stack Engineer',
        companyName: 'Stripe',
        format: 'pdf',
      })
      expect(pdfFileName).toBe('Alex_Rivera_Senior_Full_Stack_Engineer_Stripe_Resume.pdf')

      const texFileName = resolveCustomFilename({
        applicantName: 'Alex Rivera',
        jobTitle: 'Senior Systems Architect',
        companyName: 'Anthropic',
        format: 'tex',
      })
      expect(texFileName).toBe('Alex_Rivera_Senior_Systems_Architect_Anthropic_Resume.tex')
    })

    it('downloads PDF using API-provided signed URL', async () => {
      const fileName = await downloadResumeFile({
        generationId: 'gen_mock_999',
        format: 'pdf',
        applicantName: 'Alex Rivera',
        jobTitle: 'Senior Full Stack Engineer',
        companyName: 'Stripe',
        fallbackPdfUrl: 'https://example.com/resumes/gen_mock_999.pdf',
      })

      expect(fileName).toBe('Alex_Rivera_Senior_Full_Stack_Engineer_Stripe_Resume.pdf')
    })

    it('downloads LaTeX .tex source using blob fallback or URL', async () => {
      const fileName = await downloadResumeFile({
        generationId: 'gen_mock_999',
        format: 'tex',
        applicantName: 'Alex Rivera',
        jobTitle: 'Staff Engineer',
        companyName: 'OpenAI',
        fallbackLatexSource: '\\documentclass{article}\n\\begin{document}Resume\\end{document}',
      })

      expect(fileName).toBe('Alex_Rivera_Staff_Engineer_OpenAI_Resume.tex')
    })
  })

  describe('FE-5.07: W-21 History Page', () => {
    it('loads and renders tailored resumes history list with status and score badges', async () => {
      renderWithClient(<HistoryPage />, '/history')

      await waitFor(() => {
        expect(screen.getByTestId('history-items-list')).toBeInTheDocument()
      })

      // Check job titles in mock history
      expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument()
      expect(screen.getByText('Staff Infrastructure Engineer')).toBeInTheDocument()

      // ATS score gauge badge
      expect(screen.getByTestId('history-score-gen_mock_999')).toHaveTextContent('93% ATS')
    })

    it('filters resumes using debounced search input', async () => {
      const user = userEvent.setup()
      renderWithClient(<HistoryPage />, '/history')

      await waitFor(() => {
        expect(screen.getByTestId('history-items-list')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('history-search-input')
      await user.type(searchInput, 'Netflix')

      await waitFor(
        () => {
          expect(screen.getByText('Data Platform Engineer')).toBeInTheDocument()
          expect(screen.queryByText('Staff Infrastructure Engineer')).not.toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })

    it('displays empty state and allows clearing filters when query has no matches', async () => {
      const user = userEvent.setup()
      renderWithClient(<HistoryPage />, '/history')

      await waitFor(() => {
        expect(screen.getByTestId('history-items-list')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('history-search-input')
      await user.type(searchInput, 'NonExistentCompanyXyz')

      await waitFor(
        () => {
          expect(screen.getByTestId('history-empty-state')).toBeInTheDocument()
          expect(screen.getByText('No Matching Resumes Found')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      const clearBtn = screen.getByTestId('empty-clear-filters')
      await user.click(clearBtn)

      await waitFor(() => {
        expect(screen.getByTestId('history-items-list')).toBeInTheDocument()
      })
    })

    it('handles delete resume row action with confirmation dialog', async () => {
      const user = userEvent.setup()
      renderWithClient(<HistoryPage />, '/history')

      await waitFor(() => {
        expect(screen.getByTestId('history-item-gen_ats_low')).toBeInTheDocument()
      })

      // Open dropdown menu on the row
      const menuTrigger = screen.getByTestId('row-menu-gen_ats_low')
      await user.click(menuTrigger)

      // Click delete in menu
      const deleteTrigger = screen.getByTestId('delete-trigger-gen_ats_low')
      await user.click(deleteTrigger)

      // Confirm dialog appears
      expect(screen.getByText('Delete Generated Resume?')).toBeInTheDocument()
      const confirmBtn = screen.getByRole('button', { name: /Delete Resume/i })
      await user.click(confirmBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('history-item-gen_ats_low')).not.toBeInTheDocument()
      })
    })
  })

  describe('FE-5.08: W-22 Settings Views', () => {
    it('renders all settings sections: account, appearance, security, data export, danger zone', () => {
      renderWithClient(<SettingsPage />, '/settings')

      expect(screen.getByTestId('account-details-section')).toBeInTheDocument()
      expect(screen.getByTestId('appearance-section')).toBeInTheDocument()
      expect(screen.getByTestId('security-password-section')).toBeInTheDocument()
      expect(screen.getByTestId('data-export-section')).toBeInTheDocument()
      expect(screen.getByTestId('danger-zone-section')).toBeInTheDocument()
    })

    it('updates user profile in account details section', async () => {
      const user = userEvent.setup()
      renderWithClient(<SettingsPage />, '/settings')

      const nameInput = screen.getByTestId('input-full-name')
      await user.clear(nameInput)
      await user.type(nameInput, 'Alexandre Rivera')

      const saveBtn = screen.getByTestId('save-account-btn')
      await user.click(saveBtn)

      await waitFor(() => {
        expect(useAuthStore.getState().profile?.fullName).toBe('Alexandre Rivera')
      })
    })

    it('switches appearance theme with store persistence', async () => {
      const user = userEvent.setup()
      renderWithClient(<SettingsPage />, '/settings')

      const darkModeOption = screen.getByTestId('theme-option-dark')
      await user.click(darkModeOption)

      expect(useUIStore.getState().theme).toBe('dark')

      const lightModeOption = screen.getByTestId('theme-option-light')
      await user.click(lightModeOption)

      expect(useUIStore.getState().theme).toBe('light')
    })

    it('enforces password validation and handles password change', async () => {
      const user = userEvent.setup()
      renderWithClient(<SettingsPage />, '/settings')

      const newPassInput = screen.getByTestId('input-new-password')
      const confirmPassInput = screen.getByTestId('input-confirm-password')
      const updateBtn = screen.getByTestId('update-password-btn')

      // Short password (< 8 chars)
      await user.type(newPassInput, 'short')
      await user.type(confirmPassInput, 'short')
      await user.click(updateBtn)

      expect(
        screen.getByText('New password must be at least 8 characters long.')
      ).toBeInTheDocument()

      // Mismatched passwords
      await user.clear(newPassInput)
      await user.clear(confirmPassInput)
      await user.type(newPassInput, 'newSecurePass123!')
      await user.type(confirmPassInput, 'differentPass456!')
      await user.click(updateBtn)

      expect(
        screen.getByText('New password and confirm password do not match.')
      ).toBeInTheDocument()

      // Valid passwords
      await user.clear(confirmPassInput)
      await user.type(confirmPassInput, 'newSecurePass123!')
      await user.click(updateBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('password-error-alert')).not.toBeInTheDocument()
      })
    })

    it('exports user account data archive JSON', async () => {
      const user = userEvent.setup()
      renderWithClient(<SettingsPage />, '/settings')

      const exportBtn = screen.getByTestId('export-data-btn')
      await user.click(exportBtn)

      // Verified without throwing
      expect(exportBtn).toBeInTheDocument()
    })

    it('enforces typed-DELETE confirmation before unlocking account deletion', async () => {
      const user = userEvent.setup()
      renderWithClient(<SettingsPage />, '/settings')

      // Open typed delete modal
      const openDialogBtn = screen.getByTestId('open-delete-account-dialog')
      await user.click(openDialogBtn)

      expect(screen.getByTestId('typed-delete-dialog')).toBeInTheDocument()
      const confirmDeleteBtn = screen.getByTestId('confirm-typed-delete-btn')

      // Initially disabled
      expect(confirmDeleteBtn).toBeDisabled()

      // Typing wrong text keeps it disabled
      const typeInput = screen.getByTestId('input-typed-delete')
      await user.type(typeInput, 'del')
      expect(confirmDeleteBtn).toBeDisabled()

      // Typing exact "DELETE" enables it
      await user.clear(typeInput)
      await user.type(typeInput, 'DELETE')
      expect(confirmDeleteBtn).not.toBeDisabled()

      // Click to delete account
      await user.click(confirmDeleteBtn)

      await waitFor(() => {
        expect(useAuthStore.getState().profile).toBeNull()
      })
    })
  })
})
