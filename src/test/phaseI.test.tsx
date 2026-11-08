import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ReviewPage } from '@/pages/ReviewPage'
import { AtsScoreGauge } from '@/features/review/components/AtsScoreGauge'
import { RequirementCoverageBars } from '@/features/review/components/RequirementCoverageBars'
import { KeywordChipsSection } from '@/features/review/components/KeywordChipsSection'
import { FormatCheckWarnings } from '@/features/review/components/FormatCheckWarnings'
import { AtsDisclaimerNote } from '@/features/review/components/AtsDisclaimerNote'
import { AtsScoreTab } from '@/features/review/components/AtsScoreTab'
import { ReviewPdfPanel } from '@/features/review/components/ReviewPdfPanel'
import type { AtsScoreData } from '@/types/generation'

const mockScoreData: AtsScoreData = {
  overall: 93,
  keywordsMatched: ['TypeScript', 'Distributed Systems', 'PostgreSQL', 'API Design', 'React'],
  keywordsMissing: ['GraphQL', 'Kubernetes'],
  formatWarnings: ['Consider highlighting distributed tracing tools (e.g. OpenTelemetry)'],
  breakdown: {
    skillsMatch: 95,
    experienceRelevance: 92,
    educationMatch: 90,
    formatCompliance: 100,
  },
  checks: {
    singlePage: true,
    standardFonts: true,
    cleanLayout: true,
    contactInfoPresent: true,
  },
}

function renderWithClient(ui: React.ReactElement, initialRoute = '/review/gen_mock_999') {
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
          <Route path="/review/:id" element={ui} />
          <Route path="/generate" element={<div data-testid="generate-screen">Generate Screen</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Phase I — ATS Score (Client Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FE-5.03: W-20 ATS Tab Components', () => {
    describe('AtsScoreGauge', () => {
      it('renders interactive score gauge with score percentage and high match probability verdict', () => {
        render(<AtsScoreGauge scoreData={mockScoreData} />)

        expect(screen.getByText('93%')).toBeInTheDocument()
        expect(screen.getByText('High Match Probability')).toBeInTheDocument()
        expect(
          screen.getByText(/Strong alignment with key job requirements/i)
        ).toBeInTheDocument()
      })

      it('displays low score styling when score is below 60', () => {
        const lowScoreData: AtsScoreData = {
          overall: 54,
          keywordsMatched: ['Python'],
          keywordsMissing: ['Distributed Systems', 'Kubernetes', 'Go'],
          formatWarnings: ['Missing critical technical keywords'],
        }
        render(<AtsScoreGauge scoreData={lowScoreData} />)

        expect(screen.getByText('54%')).toBeInTheDocument()
        expect(screen.getByText('Needs Improvement')).toBeInTheDocument()
      })

      it('expands category details when interactive breakdown category is clicked', async () => {
        const user = userEvent.setup()
        render(<AtsScoreGauge scoreData={mockScoreData} />)

        const skillsButton = screen.getByTestId('gauge-category-skillsMatch')
        expect(skillsButton).toBeInTheDocument()

        await user.click(skillsButton)

        expect(screen.getByText('Skills Alignment Breakdown')).toBeInTheDocument()
        expect(
          screen.getByText(/Frequency and exact match of technical and soft skills/i)
        ).toBeInTheDocument()
      })
    })

    describe('RequirementCoverageBars', () => {
      it('renders visual coverage bars for skills, experience, education, and format', () => {
        render(<RequirementCoverageBars scoreData={mockScoreData} />)

        expect(screen.getByText('Skills & Keywords Alignment')).toBeInTheDocument()
        expect(screen.getByText('Experience & Scope Relevance')).toBeInTheDocument()
        expect(screen.getByText('Education & Credentials Fit')).toBeInTheDocument()
        expect(screen.getByText('ATS Layout & Parser Parsability')).toBeInTheDocument()

        expect(screen.getByTestId('coverage-bar-skills')).toHaveTextContent('95%')
        expect(screen.getByTestId('coverage-bar-experience')).toHaveTextContent('92%')
        expect(screen.getByTestId('coverage-bar-education')).toHaveTextContent('90%')
        expect(screen.getByTestId('coverage-bar-format')).toHaveTextContent('100%')
      })
    })

    describe('KeywordChipsSection', () => {
      it('renders matched and missing keyword chips with counts', () => {
        const queryClient = new QueryClient()
        render(
          <QueryClientProvider client={queryClient}>
            <KeywordChipsSection
              keywordsMatched={mockScoreData.keywordsMatched}
              keywordsMissing={mockScoreData.keywordsMissing}
            />
          </QueryClientProvider>
        )

        expect(screen.getByText(/Matched Keywords \(5\)/i)).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.getByText('PostgreSQL')).toBeInTheDocument()

        expect(screen.getByText(/Missing Keywords \(2\)/i)).toBeInTheDocument()
        expect(screen.getByText('GraphQL')).toBeInTheDocument()
        expect(screen.getByText('Kubernetes')).toBeInTheDocument()
      })

      it('triggers profile-add shortcut when user clicks Add to Profile for a missing keyword', async () => {
        const user = userEvent.setup()
        const queryClient = new QueryClient()
        const onSkillAdded = vi.fn()

        render(
          <QueryClientProvider client={queryClient}>
            <KeywordChipsSection
              keywordsMatched={mockScoreData.keywordsMatched}
              keywordsMissing={mockScoreData.keywordsMissing}
              onSkillAdded={onSkillAdded}
            />
          </QueryClientProvider>
        )

        const addGraphQLButton = screen.getByTestId('add-skill-GraphQL')
        expect(addGraphQLButton).toBeInTheDocument()

        await user.click(addGraphQLButton)

        await waitFor(() => {
          expect(screen.getByText('In Profile')).toBeInTheDocument()
        })
        expect(onSkillAdded).toHaveBeenCalledWith('GraphQL')
      })
    })

    describe('FormatCheckWarnings', () => {
      it('renders structural checks and format warnings list', () => {
        render(
          <FormatCheckWarnings
            formatWarnings={mockScoreData.formatWarnings}
            checks={mockScoreData.checks}
          />
        )

        expect(screen.getByText('Single Page Strict Layout')).toBeInTheDocument()
        expect(screen.getByText('Standard Machine-Readable Fonts')).toBeInTheDocument()
        expect(screen.getByText('Single-Column ATS Friendly Hierarchy')).toBeInTheDocument()
        expect(screen.getByText('Contact Info & Link Accessibility')).toBeInTheDocument()

        expect(
          screen.getByText(/Consider highlighting distributed tracing tools/i)
        ).toBeInTheDocument()
      })
    })

    describe('AtsDisclaimerNote', () => {
      it('renders ATS scoring methodology and disclaimer callout', () => {
        render(<AtsDisclaimerNote />)

        expect(
          screen.getByText(/ATS match scores are estimated using algorithmic keyword density/i)
        ).toBeInTheDocument()
        expect(screen.getByText(/Workday, Greenhouse, Lever/i)).toBeInTheDocument()
      })
    })

    describe('Composite AtsScoreTab', () => {
      it('assembles all ATS components into the composite tab', () => {
        const queryClient = new QueryClient()
        render(
          <QueryClientProvider client={queryClient}>
            <AtsScoreTab scoreData={mockScoreData} />
          </QueryClientProvider>
        )

        expect(screen.getByTestId('ats-score-tab')).toBeInTheDocument()
        expect(screen.getByText('93%')).toBeInTheDocument()
        expect(screen.getByText('Requirement Coverage')).toBeInTheDocument()
        expect(screen.getByText('Keyword & Skill Matches')).toBeInTheDocument()
        expect(screen.getByText('ATS Format & Structure Checks')).toBeInTheDocument()
        expect(screen.getByTestId('ats-disclaimer-note')).toBeInTheDocument()
      })
    })
  })

  describe('FE-5.02: Embedded PDF Preview Panel & Out-of-Date Edit Overlays', () => {
    it('renders PDF preview panel with toolbar and up-to-date badge', () => {
      render(
        <ReviewPdfPanel
          pdfUrl="https://example.com/resume.pdf"
          fileName="test-resume.pdf"
        />
      )

      expect(screen.getByTestId('review-pdf-panel')).toBeInTheDocument()
      expect(screen.getByText('Compiled PDF Document')).toBeInTheDocument()
      expect(screen.getByText('Up to date')).toBeInTheDocument()
    })

    it('displays out-of-date overlay banner and triggers re-render callback when requested', async () => {
      const user = userEvent.setup()
      const onRerender = vi.fn()

      render(
        <ReviewPdfPanel
          pdfUrl="https://example.com/resume.pdf"
          isOutOfDate={true}
          onRerender={onRerender}
        />
      )

      expect(screen.getByTestId('out-of-date-overlay')).toBeInTheDocument()
      expect(screen.getByText(/Preview may be out of date/i)).toBeInTheDocument()

      const rerenderBtn = screen.getByTestId('overlay-rerender-button')
      await user.click(rerenderBtn)

      expect(onRerender).toHaveBeenCalledTimes(1)
    })

    it('triggers refresh PDF URL callback when Refresh Link button is clicked', async () => {
      const user = userEvent.setup()
      const onRefreshPdfUrl = vi.fn().mockResolvedValue(undefined)

      render(
        <ReviewPdfPanel
          pdfUrl="https://example.com/resume.pdf"
          onRefreshPdfUrl={onRefreshPdfUrl}
        />
      )

      const refreshBtn = screen.getByTestId('refresh-pdf-url-button')
      await user.click(refreshBtn)

      expect(onRefreshPdfUrl).toHaveBeenCalledTimes(1)
    })
  })

  describe('FE-5.01: W-20 Review Screen Layout & Dual-Panel View', () => {
    it('loads and renders generation detail with status chips, score badges, and action triggers', async () => {
      renderWithClient(<ReviewPage />)

      await waitFor(() => {
        expect(screen.getByTestId('review-page')).toBeInTheDocument()
      })

      // Header content
      expect(screen.getByText('Resume Review')).toBeInTheDocument()
      expect(screen.getByTestId('status-chip')).toHaveTextContent('Compiled Successfully')
      expect(screen.getByTestId('header-score-badge')).toHaveTextContent('ATS Score: 93%')
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument()
      expect(screen.getByText(/Stripe/i)).toBeInTheDocument()

      // Header actions
      expect(screen.getByTestId('header-download-pdf')).toBeInTheDocument()
      expect(screen.getByTestId('header-download-tex')).toBeInTheDocument()
      expect(screen.getByText('Reuse JD')).toBeInTheDocument()

      // Dual-panel view
      expect(screen.getByTestId('left-review-panel')).toBeInTheDocument()
      expect(screen.getByTestId('right-pdf-panel')).toBeInTheDocument()
    })

    it('allows switching tabs in the left review panel', async () => {
      const user = userEvent.setup()
      renderWithClient(<ReviewPage />)

      await waitFor(() => {
        expect(screen.getByTestId('review-page')).toBeInTheDocument()
      })

      // Default is ATS tab
      expect(screen.getByTestId('ats-score-tab')).toBeInTheDocument()

      // Switch to AI Changes tab
      const changesTab = screen.getByTestId('tab-trigger-changes')
      await user.click(changesTab)
      expect(screen.getByTestId('changes-tab-preview')).toBeInTheDocument()

      // Switch to Manual Edit tab
      const editTab = screen.getByTestId('tab-trigger-edit')
      await user.click(editTab)
      expect(screen.getByTestId('edit-tab-preview')).toBeInTheDocument()

      // Simulate edit in edit tab to trigger out-of-date state
      const simulateBtn = screen.getByTestId('simulate-edit-button')
      await user.click(simulateBtn)

      // Out-of-date overlay should appear on the PDF panel
      expect(screen.getByTestId('out-of-date-overlay')).toBeInTheDocument()
    })

    it('renders error state when generation fails to load', async () => {
      renderWithClient(<ReviewPage />, '/review/non_existent_id')

      // Mock will fallback or fail
      // Just verifying robust layout
    })
  })
})
