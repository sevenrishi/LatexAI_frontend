import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { GeneratePage } from '@/pages/GeneratePage'
import { UsageCounters } from '@/features/generate/components/UsageCounters'

function renderWithClient(ui: React.ReactElement, initialRoute = '/generate') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Phase D — Job Input & Generation Initialization', () => {
  describe('FE-4.01: W-18 New Resume Page Shell & Segmented Control & Usage Counters', () => {
    it('renders the W-18 page shell with segmented control tabs and template selector', async () => {
      renderWithClient(<GeneratePage />)

      expect(screen.getByRole('heading', { name: /Tailor Resume to Job/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Paste Text/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Job URL/i })).toBeInTheDocument()
      expect(screen.getByText(/Target LaTeX Template:/i)).toBeInTheDocument()
    })

    it('displays usage counters with daily quota and remaining count', () => {
      render(
        <UsageCounters
          usage={{
            dailyLimit: 5,
            usedToday: 2,
            remainingToday: 3,
            resetsAt: '2026-10-06T00:00:00Z',
          }}
        />
      )

      expect(screen.getByText(/3 of 5/i)).toBeInTheDocument()
      expect(screen.getByText(/remaining today/i)).toBeInTheDocument()
      expect(screen.getByText(/40%/i)).toBeInTheDocument()
    })

    it('switches between "Paste text" and "Job URL" tabs via segmented control', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      // Initially on Paste Text tab
      expect(
        screen.getByPlaceholderText(/Paste full job posting text here/i)
      ).toBeInTheDocument()

      // Switch to Job URL tab
      const urlTab = screen.getByRole('tab', { name: /Job URL/i })
      await user.click(urlTab)

      expect(
        screen.getByPlaceholderText('https://jobs.lever.co/company/role')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Extract JD/i })).toBeInTheDocument()

      // Switch back to Paste Text tab
      const pasteTab = screen.getByRole('tab', { name: /Paste Text/i })
      await user.click(pasteTab)
      expect(
        screen.getByPlaceholderText(/Paste full job posting text here/i)
      ).toBeInTheDocument()
    })
  })

  describe('FE-4.02: Job URL Fetch & Live Extraction Preview & Fallback', () => {
    it('fetches remote job posting and displays live extraction preview card', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      // Switch to URL tab
      await user.click(screen.getByRole('tab', { name: /Job URL/i }))

      const urlInput = screen.getByPlaceholderText('https://jobs.lever.co/company/role')
      fireEvent.change(urlInput, {
        target: { value: 'https://jobs.lever.co/anthropic/systems-engineer' },
      })

      const extractBtn = screen.getByRole('button', { name: /Extract JD/i })
      await user.click(extractBtn)

      // Expect live extraction preview card to appear
      await waitFor(() => {
        expect(screen.getByText(/Job Extracted Successfully/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/Senior Distributed Systems Engineer/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Anthropic/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Distributed Systems/i).length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /Use Extracted Text/i })).toBeInTheDocument()
    })

    it('automatically switches to "Paste text" tab on URL_BLOCKED bot protection error', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      // Switch to URL tab
      await user.click(screen.getByRole('tab', { name: /Job URL/i }))

      const urlInput = screen.getByPlaceholderText('https://jobs.lever.co/company/role')
      // Typing url containing 'blocked' or 'linkedin.com' triggers URL_BLOCKED in mock handler
      fireEvent.change(urlInput, {
        target: { value: 'https://www.linkedin.com/jobs/view/12345678' },
      })

      const extractBtn = screen.getByRole('button', { name: /Extract JD/i })
      await user.click(extractBtn)

      // Should automatically fallback to paste text tab and show explanation
      await waitFor(() => {
        expect(screen.getByText(/Switched to Text Paste Mode/i)).toBeInTheDocument()
      })

      // Must be back on Paste Text tab
      expect(
        screen.getByPlaceholderText(/Paste full job posting text here/i)
      ).toBeInTheDocument()
    })

    it('automatically switches to "Paste text" tab on URL_FETCH_FAILED error', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      // Switch to URL tab
      await user.click(screen.getByRole('tab', { name: /Job URL/i }))

      const urlInput = screen.getByPlaceholderText('https://jobs.lever.co/company/role')
      // Typing url containing 'fail' triggers URL_FETCH_FAILED in mock handler
      fireEvent.change(urlInput, {
        target: { value: 'https://broken-domain.com/fail-job' },
      })

      const extractBtn = screen.getByRole('button', { name: /Extract JD/i })
      await user.click(extractBtn)

      // Should automatically fallback to paste text tab
      await waitFor(() => {
        expect(screen.getByText(/Switched to Text Paste Mode/i)).toBeInTheDocument()
      })
      expect(
        screen.getByPlaceholderText(/Paste full job posting text here/i)
      ).toBeInTheDocument()
    })
  })

  describe('FE-4.03: Job Submission to POST /generate & Specific Error Handling with Actionable Links', () => {
    it('submits job description and triggers generation', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      // Insert sample JD
      const sampleBtn = screen.getByRole('button', { name: /Insert Sample JD/i })
      await user.click(sampleBtn)

      const generateBtn = screen.getByRole('button', {
        name: /Analyze & Tailor LaTeX Resume/i,
      })
      expect(generateBtn).not.toBeDisabled()

      await user.click(generateBtn)

      await waitFor(() => {
        expect(generateBtn).toBeInTheDocument()
      })
    })

    it('handles PROFILE_INCOMPLETE error with direct actionable link to /profile', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      const textarea = screen.getByPlaceholderText(/Paste full job posting text here/i)
      fireEvent.change(textarea, {
        target: {
          value:
            'Staff Software Engineer TRIGGER_PROFILE_INCOMPLETE with deep experience in distributed databases',
        },
      })

      const generateBtn = screen.getByRole('button', {
        name: /Analyze & Tailor LaTeX Resume/i,
      })
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      expect(screen.getByText(/Career Profile Incomplete/i)).toBeInTheDocument()
      const completeProfileLink = screen.getByRole('link', {
        name: /Complete Career Profile/i,
      })
      expect(completeProfileLink).toBeInTheDocument()
      expect(completeProfileLink).toHaveAttribute('href', '/profile')
    })

    it('handles QUOTA_EXCEEDED error with link to /history', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      const textarea = screen.getByPlaceholderText(/Paste full job posting text here/i)
      fireEvent.change(textarea, {
        target: {
          value:
            'Staff Software Engineer TRIGGER_QUOTA_EXCEEDED with deep experience in distributed databases',
        },
      })

      const generateBtn = screen.getByRole('button', {
        name: /Analyze & Tailor LaTeX Resume/i,
      })
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      expect(screen.getByText(/Daily Generation Limit Reached/i)).toBeInTheDocument()
      const historyLink = screen.getByRole('link', {
        name: /View Previously Generated Resumes/i,
      })
      expect(historyLink).toBeInTheDocument()
      expect(historyLink).toHaveAttribute('href', '/history')
    })

    it('handles RATE_LIMITED error with retry button', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />)

      const textarea = screen.getByPlaceholderText(/Paste full job posting text here/i)
      fireEvent.change(textarea, {
        target: {
          value:
            'Staff Software Engineer TRIGGER_RATE_LIMITED with deep experience in distributed databases',
        },
      })

      const generateBtn = screen.getByRole('button', {
        name: /Analyze & Tailor LaTeX Resume/i,
      })
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      expect(screen.getByText(/Rate Limit Exceeded/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Try Again Now/i })).toBeInTheDocument()
    })
  })

  describe('FE-4.04: Pre-filling Inputs from Query Params (?from=<generationId>)', () => {
    it('pre-fills job details from source generation id in query params', async () => {
      renderWithClient(<GeneratePage />, '/generate?from=gen_mock_999')

      // Wait for previous generation query to load and populate role
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Staff Software Engineer/i)).toHaveValue(
          'Senior Full Stack Engineer'
        )
      })

      expect(screen.getByText(/Reusing Job Description:/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Senior Full Stack Engineer/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Stripe/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/93% ATS/i)).toBeInTheDocument()

      const companyInput = screen.getByPlaceholderText(/Stripe/i)
      expect(companyInput).toHaveValue('Stripe')

      const textarea = screen.getByPlaceholderText(/Paste full job posting text here/i)
      expect(textarea).toHaveValue(
        'We are looking for a Senior Full Stack Engineer to build reliable, high-throughput payment infrastructure and developer-facing APIs. You will work with TypeScript, React, Go, and PostgreSQL to build scalable systems handling millions of daily transactions.'
      )
    })

    it('allows clearing reused generation and starting fresh', async () => {
      const user = userEvent.setup()
      renderWithClient(<GeneratePage />, '/generate?from=gen_mock_999')

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Staff Software Engineer/i)).toHaveValue(
          'Senior Full Stack Engineer'
        )
      })

      const clearBtn = screen.getByRole('button', { name: /Clear & Start Fresh/i })
      await user.click(clearBtn)

      // Reused banner should disappear and inputs cleared
      await waitFor(() => {
        expect(screen.queryByText(/Reusing Job Description:/i)).not.toBeInTheDocument()
      })
      const roleInput = screen.getByPlaceholderText(/Staff Software Engineer/i)
      expect(roleInput).toHaveValue('')
    })
  })
})
