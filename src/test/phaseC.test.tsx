import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { lintTemplate } from '@/features/templates/utils/lintTemplate'
import {
  extractPlaceholders,
  checkPlaceholderCoverage,
} from '@/features/templates/utils/placeholders'
import { PdfViewer } from '@/features/templates/components/PdfViewer'
import { TemplateCard } from '@/features/templates/components/TemplateCard'
import { TemplatePlaceholdersTab } from '@/features/templates/components/TemplatePlaceholdersTab'
import { TemplateLintTab } from '@/features/templates/components/TemplateLintTab'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { NewTemplatePage } from '@/pages/NewTemplatePage'
import type { Template } from '@/types/template'

function renderWithClient(ui: React.ReactElement, initialRoute = '/') {
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

describe('Phase C — LaTeX Templates System', () => {
  describe('FE-3.06 & Client Linter & Placeholders Contract', () => {
    it('extracts placeholders and verifies coverage correctly', () => {
      const sample = `
        \\documentclass{article}
        \\begin{document}
        {{FULL_NAME}}
        {{SUMMARY}}
        {{EXPERIENCE_BLOCK}}
        \\end{document}
      `
      const extracted = extractPlaceholders(sample)
      expect(extracted).toContain('{{FULL_NAME}}')
      expect(extracted).toContain('{{SUMMARY}}')
      expect(extracted).toContain('{{EXPERIENCE_BLOCK}}')

      const coverage = checkPlaceholderCoverage(sample)
      expect(coverage.isComplete).toBe(false) // Missing SKILLS_BLOCK & EDUCATION_BLOCK
      expect(coverage.missingRequired.some((p) => p.token === '{{SKILLS_BLOCK}}')).toBe(true)
    })

    it('blocks dangerous LaTeX commands and primitives', () => {
      const malicious = `
        \\documentclass{article}
        \\begin{document}
        \\write18{cat /etc/passwd}
        \\openin1=secret.txt
        {{SUMMARY}}
        \\end{document}
      `
      const issues = lintTemplate(malicious)
      const shellEscapeIssue = issues.find((i) => i.rule === 'no-shell-escape')
      const ioIssue = issues.find((i) => i.rule === 'no-io-primitives')

      expect(shellEscapeIssue).toBeDefined()
      expect(shellEscapeIssue?.type).toBe('error')
      expect(ioIssue).toBeDefined()
    })

    it('flags unclosed braces and missing document structure', () => {
      const invalid = `
        \\begin{document}
        \\textbf{Unclosed bracket
        \\end{document}
      `
      const issues = lintTemplate(invalid)
      expect(issues.some((i) => i.id === 'missing-documentclass')).toBe(true)
      expect(issues.some((i) => i.rule === 'syntax-braces')).toBe(true)
    })
  })

  describe('FE-3.01: PdfViewer Component', () => {
    it('renders empty compile state when no PDF file is provided', () => {
      const handleCompile = vi.fn()
      render(
        <PdfViewer
          file={null}
          emptyMessage="Compile LaTeX to view rendered PDF"
          onCompileRequest={handleCompile}
        />
      )

      expect(screen.getByText('No PDF Compiled Yet')).toBeInTheDocument()
      expect(screen.getByText('Compile LaTeX to view rendered PDF')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /compile preview/i })).toBeInTheDocument()
    })
  })

  describe('FE-3.02: TemplateCard and Templates List View', () => {
    const testTemplate: Template = {
      id: 'tpl_test',
      name: 'High ATS Tech',
      slug: 'high-ats-tech',
      description: 'Single column clean layout.',
      category: 'Engineering',
      isDefault: true,
      isActive: true,
      latexSource: '\\documentclass{article}\\begin{document}{{SUMMARY}}\\end{document}',
      placeholders: ['{{SUMMARY}}'],
    }

    it('displays active badge and system default tag', () => {
      const onSelect = vi.fn()
      const onEdit = vi.fn()
      const onActivate = vi.fn()
      const onDuplicate = vi.fn()

      render(
        <TemplateCard
          template={testTemplate}
          onSelect={onSelect}
          onEdit={onEdit}
          onActivate={onActivate}
          onDuplicate={onDuplicate}
        />
      )

      expect(screen.getByText('High ATS Tech')).toBeInTheDocument()
      expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
      expect(screen.getByText('System Default')).toBeInTheDocument()
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })

    it('renders the TemplatesPage list with active banner and filters', async () => {
      renderWithClient(<TemplatesPage />)

      expect(screen.getByRole('heading', { name: /latex templates/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /new custom template/i })).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getAllByText('Modern Software Engineer').length).toBeGreaterThan(0)
      })
    })
  })

  describe('FE-3.03: New Template View', () => {
    it('renders tabs for duplicate default, file upload, and paste LaTeX code', () => {
      renderWithClient(<NewTemplatePage />)

      expect(screen.getByRole('heading', { name: /create latex template/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /duplicate default/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /upload \.tex file/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /paste latex code/i })).toBeInTheDocument()
      expect(screen.getByText('Client Lint Analysis')).toBeInTheDocument()
    })
  })

  describe('FE-3.06: Placeholders Tab & Lint Tab Components', () => {
    it('renders placeholder items with copy and insert triggers', async () => {
      const user = userEvent.setup()
      const onInsert = vi.fn()

      render(
        <TemplatePlaceholdersTab
          latexSource="\\documentclass{article}\\begin{document}{{FULL_NAME}}\\end{document}"
          onInsertPlaceholder={onInsert}
        />
      )

      expect(screen.getByText('Placeholder Contract Coverage')).toBeInTheDocument()
      expect(screen.getByText('{{SUMMARY}}')).toBeInTheDocument()
      expect(screen.getByText('{{FULL_NAME}}')).toBeInTheDocument()

      const insertButtons = screen.getAllByRole('button', { name: /insert/i })
      if (insertButtons.length > 0) {
        await user.click(insertButtons[0])
        expect(onInsert).toHaveBeenCalled()
      }
    })

    it('renders lint tab with issues and jump trigger', () => {
      const onJump = vi.fn()
      render(
        <TemplateLintTab
          latexSource="\\documentclass{article}\n\\begin{document}\n\\write18{malicious}\n\\end{document}"
          onJumpToLine={onJump}
        />
      )

      expect(screen.getByText(/critical error/i)).toBeInTheDocument()
      expect(screen.getByText(/dangerous command \\write18/i)).toBeInTheDocument()
    })
  })
})
