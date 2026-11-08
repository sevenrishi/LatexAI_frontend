export type HistoryItemStatus =
  | 'QUEUED'
  | 'ANALYZING'
  | 'TAILORING'
  | 'RENDERING'
  | 'COMPILING'
  | 'COMPLETED'
  | 'FAILED'

export interface ResumeHistoryItem {
  id: string
  jobTitle: string
  companyName: string
  jobUrl?: string
  templateId?: string
  templateName: string
  status: HistoryItemStatus
  atsScore?: number
  createdAt: string
  compiledPdfUrl?: string
  latexSource?: string
  errorMessage?: string
}

export interface HistoryListResponse {
  items: ResumeHistoryItem[]
  nextCursor: string | null
  hasMore: boolean
  totalCount: number
}

export interface HistoryFilterParams {
  search?: string
  status?: string
  minScore?: number
  maxScore?: number
  cursor?: string | null
  limit?: number
}
