import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, renderHook, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useGenerationStatus } from '@/features/generate/hooks/useGenerationStatus'
import { VerticalStatusStepper, PIPELINE_STEPS } from '@/features/generate/components/VerticalStatusStepper'
import { ElapsedTimer } from '@/features/generate/components/ElapsedTimer'
import { RotatingTips, ROTATING_TIPS } from '@/features/generate/components/RotatingTips'
import { GenerationErrorCard } from '@/features/generate/components/GenerationErrorCard'
import { GenerationProgressPage } from '@/pages/GenerationProgressPage'

function renderWithClient(ui: React.ReactElement, initialRoute = '/generate/gen_mock_999') {
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
          <Route path="/generate/:id" element={ui} />
          <Route path="/generate/:id/progress" element={ui} />
          <Route path="/review/:id" element={<div data-testid="review-screen">Review Screen</div>} />
          <Route path="/generate" element={<div data-testid="generate-screen">Generate Screen</div>} />
          <Route path="/templates" element={<div data-testid="templates-screen">Templates Screen</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Phase E/F — JD Analysis & Tailoring (Client Integration)', () => {
  describe('FE-4.05: useGenerationStatus(id) Polling Hook', () => {
    it('initializes and polls status reaching COMPLETED', async () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useGenerationStatus('gen_mock_999', {
          initialInterval: 100,
          onComplete,
        })
      )

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true)
      })

      expect(result.current.status).toBe('COMPLETED')
      expect(result.current.progress).toBe(100)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('handles FAILED status and triggers onError callback', async () => {
      const onError = vi.fn()
      const { result } = renderHook(() =>
        useGenerationStatus('gen_fail_test', {
          initialInterval: 100,
          onError,
        })
      )

      await waitFor(() => {
        expect(result.current.isFailed).toBe(true)
      })

      expect(result.current.status).toBe('FAILED')
      expect(result.current.error?.code).toBe('COMPILATION_FAILED')
      expect(onError).toHaveBeenCalled()
    })

    it('pauses polling when tab is hidden and resumes when tab becomes visible', async () => {
      let visibilityState = 'visible'
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => visibilityState,
      })

      const { result } = renderHook(() =>
        useGenerationStatus('gen_analyzing_test', {
          initialInterval: 100,
        })
      )

      await waitFor(() => {
        expect(result.current.status).toBe('ANALYZING')
      })

      // Simulate tab switching to background
      act(() => {
        visibilityState = 'hidden'
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(result.current.isTabVisible).toBe(false)

      // Simulate tab returning to active foreground
      act(() => {
        visibilityState = 'visible'
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(result.current.isTabVisible).toBe(true)
    })

    it('supports manual retry resetting elapsed time and error state', async () => {
      const { result } = renderHook(() =>
        useGenerationStatus('gen_fail_retry', {
          initialInterval: 100,
        })
      )

      await waitFor(() => {
        expect(result.current.isFailed).toBe(true)
      })

      await act(async () => {
        await result.current.retry()
      })

      // After retry, error is cleared
      expect(result.current.error).toBeNull()
    })
  })

  describe('FE-4.06: W-19 Generation Progress Components', () => {
    describe('VerticalStatusStepper', () => {
      it('renders all 5 pipeline execution stages', () => {
        render(
          <VerticalStatusStepper
            currentStatus="TAILORING"
            currentStageText="Grounding bullet points in verified achievements..."
          />
        )

        PIPELINE_STEPS.forEach((step) => {
          expect(screen.getByText(step.title)).toBeInTheDocument()
        })

        // Step 1 should be marked as completed
        expect(screen.getByText(/Completed/i)).toBeInTheDocument()

        // Step 2 should be marked In Progress
        expect(screen.getByText(/In Progress/i)).toBeInTheDocument()

        // Should display the active stage live indicator
        expect(
          screen.getByText(/Grounding bullet points in verified achievements/i)
        ).toBeInTheDocument()
      })

      it('displays Failed badge when current stage failed', () => {
        render(
          <VerticalStatusStepper
            currentStatus="COMPILING"
            isFailed={true}
          />
        )

        expect(screen.getByText(/Failed Here/i)).toBeInTheDocument()
      })
    })

    describe('ElapsedTimer', () => {
      it('formats elapsed time in MM:SS', () => {
        render(<ElapsedTimer elapsedSeconds={75} estimatedSeconds={25} />)

        expect(screen.getByText('01:15')).toBeInTheDocument()
        expect(screen.getByText('~25s')).toBeInTheDocument()
        expect(screen.getByText(/Live/i)).toBeInTheDocument()
      })

      it('shows background pause banner when tab is inactive', () => {
        render(<ElapsedTimer elapsedSeconds={45} isTabVisible={false} />)

        expect(screen.getByText(/Paused in background/i)).toBeInTheDocument()
        expect(screen.getByText(/Background tab detected/i)).toBeInTheDocument()
      })

      it('shows finished badge when completed', () => {
        render(<ElapsedTimer elapsedSeconds={18} isCompleted={true} />)

        expect(screen.getByText(/Finished in 00:18/i)).toBeInTheDocument()
      })
    })

    describe('RotatingTips', () => {
      it('renders tip title, description, and navigation controls', async () => {
        const user = userEvent.setup()
        render(<RotatingTips intervalMs={10000} />)

        expect(screen.getByText(ROTATING_TIPS[0].title)).toBeInTheDocument()
        expect(screen.getByText(ROTATING_TIPS[0].text)).toBeInTheDocument()

        // Click next tip
        const nextBtn = screen.getByRole('button', { name: /Next Tip/i })
        await user.click(nextBtn)

        expect(screen.getByText(ROTATING_TIPS[1].title)).toBeInTheDocument()

        // Click previous tip
        const prevBtn = screen.getByRole('button', { name: /Previous Tip/i })
        await user.click(prevBtn)

        expect(screen.getByText(ROTATING_TIPS[0].title)).toBeInTheDocument()
      })
    })

    describe('GenerationErrorCard', () => {
      it('renders error code, description, and expands compiler diagnostic log', async () => {
        const user = userEvent.setup()
        const onRetry = vi.fn()

        render(
          <MemoryRouter>
            <GenerationErrorCard
              error={{
                code: 'COMPILATION_FAILED',
                message: 'LaTeX syntax error on line 42',
                details: {
                  line: 42,
                  log: '! Undefined control sequence: \\custommacro',
                },
              }}
              onRetry={onRetry}
            />
          </MemoryRouter>
        )

        expect(screen.getByText('COMPILATION_FAILED')).toBeInTheDocument()
        expect(screen.getByText(/LaTeX syntax error on line 42/i)).toBeInTheDocument()

        // Compiler log toggle
        const toggleLogBtn = screen.getByRole('button', { name: /Compiler Diagnostic Log/i })
        expect(screen.queryByText(/! Undefined control sequence/i)).not.toBeInTheDocument()

        await user.click(toggleLogBtn)
        expect(screen.getByText(/! Undefined control sequence/i)).toBeInTheDocument()

        // Retry button
        const retryBtn = screen.getByRole('button', { name: /Retry Generation/i })
        await user.click(retryBtn)
        expect(onRetry).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('FE-4.06 & FE-4.07: GenerationProgressPage & Completion Routing', () => {
    it('renders the W-19 progress screen with stepper, timer, and tips', async () => {
      renderWithClient(<GenerationProgressPage />, '/generate/gen_analyzing_1')

      expect(screen.getByTestId('generation-progress-page')).toBeInTheDocument()
      expect(screen.getByText(/Tailoring Resume/i)).toBeInTheDocument()
      expect(screen.getByTestId('vertical-status-stepper')).toBeInTheDocument()
      expect(screen.getByTestId('elapsed-timer')).toBeInTheDocument()
      expect(screen.getByTestId('rotating-tips')).toBeInTheDocument()
    })

    it('renders error card with retry action when generation fails', async () => {
      renderWithClient(<GenerationProgressPage />, '/generate/gen_fail_page')

      await waitFor(() => {
        expect(screen.getByTestId('generation-error-card')).toBeInTheDocument()
      })

      expect(screen.getByText(/COMPILATION_FAILED/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Retry Generation/i })).toBeInTheDocument()
    })

    it('FE-4.07: transitions into completed state with celebration card and review navigation', async () => {
      const user = userEvent.setup()
      renderWithClient(<GenerationProgressPage />, '/generate/gen_mock_999')

      await waitFor(() => {
        expect(
          screen.getByText(/Resume Tailored & Compiled Successfully!/i)
        ).toBeInTheDocument()
      })

      expect(screen.getByText(/Single Page Confirmed/i)).toBeInTheDocument()
      expect(screen.getByText(/pdflatex \(TeX Live\)/i)).toBeInTheDocument()

      const reviewBtn = screen.getByRole('button', { name: /View Tailored Resume/i })
      expect(reviewBtn).toBeInTheDocument()

      await user.click(reviewBtn)
      await waitFor(() => {
        expect(screen.getByTestId('review-screen')).toBeInTheDocument()
      })
    })
  })
})
