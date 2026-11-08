export interface Template {
  id: string
  name: string
  slug?: string
  description: string
  category?: 'Engineering' | 'Academic' | 'Minimalist' | 'Executive' | 'Creative' | string
  isDefault: boolean
  isActive?: boolean
  latexSource: string
  placeholders: string[]
  samplePdfUrl?: string
  createdAt?: string
  updatedAt?: string
  userId?: string | null
}

export interface TemplatePlaceholder {
  id: string
  token: string
  label: string
  category: 'Profile' | 'Experience' | 'Education' | 'Skills' | 'Projects' | 'Custom'
  description: string
  required: boolean
  exampleSnippet: string
}

export type LintSeverity = 'error' | 'warning' | 'info'

export interface TemplateLintIssue {
  id: string
  type: LintSeverity
  message: string
  line?: number
  column?: number
  rule: string
  codeSnippet?: string
}

export interface CompileError {
  line?: number
  message: string
  code?: string
  raw?: string
}

export interface CompilePreviewRequest {
  templateId?: string
  latexSource?: string
  dataSource: 'sample' | 'profile'
}

export interface CompilePreviewResponse {
  success: boolean
  pdfUrl?: string
  pdfBase64?: string
  compileLogs?: string
  errors?: CompileError[]
  durationMs?: number
  cached?: boolean
}

export interface CreateTemplateInput {
  name: string
  description?: string
  category?: string
  latexSource: string
  basedOnId?: string
}

export interface UpdateTemplateInput {
  name?: string
  description?: string
  category?: string
  latexSource?: string
}
