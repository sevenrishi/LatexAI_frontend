import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { analytics } from '@/lib/analytics'
import { errorTracker } from '@/lib/errorTracking'
import { verifyProductionDeployment } from '@/lib/verifyDeployment'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { ReviewPage } from '@/pages/ReviewPage'
import { useUIStore } from '@/store/uiStore'

// Component that throws for ErrorBoundary testing
function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Explosion in BombComponent!')
  }
  return <div data-testid="bomb-safe">All clear</div>
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
          <Route path="/review/:id" element={ui} />
          <Route path="/generate" element={<div data-testid="generate-screen">Generate</div>} />
          <Route path="/dashboard" element={<div data-testid="dashboard-screen">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Phase L — Testing, QA, Accessibility, and Production Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    analytics.clearQueue()
    errorTracker.clear()
    useUIStore.setState({ theme: 'system', mobileMenuOpen: false })
  })

  describe('FE-7.01: Mobile-to-Desktop Responsive QA Layout Passes', () => {
    it('provides mobile view toggle switch between review details and PDF preview on mobile', async () => {
      const user = userEvent.setup()
      renderWithClient(<ReviewPage />, '/review/gen_mock_999')

      await waitFor(() => {
        expect(screen.getByTestId('review-page')).toBeInTheDocument()
      })

      // Mobile view toggle buttons exist
      const detailsToggleBtn = screen.getByRole('button', { name: /ATS & Review Details/i })
      const pdfToggleBtn = screen.getByRole('button', { name: /PDF Document Preview/i })

      expect(detailsToggleBtn).toBeVisible()
      expect(pdfToggleBtn).toBeVisible()

      // Switching to PDF preview view on mobile
      await user.click(pdfToggleBtn)
      // Left review panel has hidden lg:block class when PDF preview is active on mobile
      const leftPanel = screen.getByTestId('left-review-panel')
      expect(leftPanel).toHaveClass('hidden')

      // Switching back to Details view
      await user.click(detailsToggleBtn)
      expect(leftPanel).not.toHaveClass('hidden')
    })

    it('toggles mobile drawer navigation menu in AppLayout', async () => {
      const user = userEvent.setup()
      renderWithClient(<AppLayout />)

      // Open mobile menu
      const menuBtn = screen.getByRole('button', { name: /Open navigation menu/i })
      await user.click(menuBtn)

      expect(useUIStore.getState().mobileMenuOpen).toBe(true)
    })
  })

  describe('FE-7.02: Accessibility (a11y) Audits & Keyboard Navigability', () => {
    it('renders accessible skip to main content links in AppLayout and MarketingLayout', () => {
      const { unmount } = renderWithClient(<AppLayout />)
      const skipLink = screen.getByRole('link', { name: /Skip to main content/i })
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
      unmount()

      renderWithClient(<MarketingLayout />)
      const marketingSkipLink = screen.getByRole('link', { name: /Skip to main content/i })
      expect(marketingSkipLink).toBeInTheDocument()
      expect(marketingSkipLink).toHaveAttribute('href', '#main-content')
    })

    it('ensures main content area has id="main-content" and tabIndex for focus management', () => {
      renderWithClient(<AppLayout />)
      const mainElement = document.getElementById('main-content')
      expect(mainElement).not.toBeNull()
      expect(mainElement).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('FE-7.04: Production Error Tracking & Analytics Funnel Metrics', () => {
    it('tracks analytics events and dispatches custom DOM notifications', () => {
      const eventSpy = vi.fn()
      window.addEventListener('latexai:analytics', eventSpy)

      analytics.track('generation_started', {
        templateId: 'tmpl_ats_default',
        jobTitle: 'Distributed Systems Engineer',
      })

      expect(analytics.getRecentEvents()).toHaveLength(1)
      expect(analytics.getRecentEvents()[0].event).toBe('generation_started')
      expect(eventSpy).toHaveBeenCalled()

      analytics.trackPageView('/dashboard', 'Dashboard')
      expect(analytics.getRecentEvents()).toHaveLength(2)
      expect(analytics.getRecentEvents()[1].event).toBe('page_view')

      window.removeEventListener('latexai:analytics', eventSpy)
    })

    it('captures errors with context and breadcrumbs in errorTracker', () => {
      errorTracker.addBreadcrumb('navigation', 'User clicked generate button')
      const errorId = errorTracker.captureException(new Error('LaTeX compilation crash'), {
        line: 42,
      })

      expect(errorId).toMatch(/^err_/)
      const captured = errorTracker.getCapturedErrors()
      expect(captured).toHaveLength(1)
      expect(captured[0].message).toBe('LaTeX compilation crash')
      expect(captured[0].breadcrumbs).toHaveLength(1)
      expect(captured[0].breadcrumbs[0].message).toBe('User clicked generate button')
    })

    it('forwards uncaught React errors from ErrorBoundary to errorTracker and analytics', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const captureSpy = vi.spyOn(errorTracker, 'captureException')
      const trackSpy = vi.spyOn(analytics, 'track')

      render(
        <ErrorBoundary>
          <BombComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(captureSpy).toHaveBeenCalled()
      expect(trackSpy).toHaveBeenCalledWith('error_occurred', expect.objectContaining({
        type: 'react_component_error',
      }))

      consoleErrorSpy.mockRestore()
    })
  })

  describe('FE-7.06: Production Deployment & CORS Verification', () => {
    it('verifies production configuration readiness with report output', async () => {
      const report = await verifyProductionDeployment('http://localhost:4000/api/v1')

      expect(report).toBeDefined()
      expect(report.checks.length).toBeGreaterThanOrEqual(3)
      expect(report.checks.some((c) => c.id === 'env_api_url')).toBe(true)
      expect(report.checks.some((c) => c.id === 'env_supabase')).toBe(true)
      expect(report.checks.some((c) => c.id === 'env_app_url')).toBe(true)
      expect(report.isReady).toBe(true)
    })
  })
})
