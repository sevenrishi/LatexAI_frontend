export interface JobFetchRequest {
  url: string
}

export interface JobFetchResponse {
  jobTitle?: string
  companyName?: string
  location?: string
  jobText: string
  extractedKeywords?: string[]
  url: string
}

export interface GenerateRequest {
  jobText?: string
  jobDescription?: string
  jobTitle?: string
  companyName?: string
  jobUrl?: string
  templateId?: string
  targetPageCount?: number
  sourceGenerationId?: string
}

export type GenerationStatus =
  | 'QUEUED'
  | 'ANALYZING'
  | 'TAILORING'
  | 'RENDERING'
  | 'COMPILING'
  | 'COMPLETED'
  | 'FAILED'

export interface GenerationStatusError {
  code?: string
  message?: string
  details?: {
    log?: string
    line?: number
    rawOutput?: string
  }
}

export interface GenerationStatusResponse {
  id: string
  status: GenerationStatus
  stage?: string
  progress?: number
  currentStep?: number
  totalSteps?: number
  jobTitle?: string
  companyName?: string
  templateId?: string
  templateName?: string
  compiledPdfUrl?: string
  error?: GenerationStatusError
}

export interface GenerateResponse {
  id: string
  status: GenerationStatus
  message?: string
}

export interface GenerationUsage {
  dailyLimit: number
  usedToday: number
  remainingToday: number
  resetsAt: string
}

export interface AtsScoreBreakdown {
  skillsMatch: number
  experienceRelevance: number
  educationMatch: number
  formatCompliance?: number
}

export interface AtsFormatChecks {
  singlePage: boolean
  standardFonts: boolean
  cleanLayout: boolean
  contactInfoPresent: boolean
}

export interface AtsScoreData {
  overall: number
  keywordsMatched: string[]
  keywordsMissing: string[]
  formatWarnings: string[]
  breakdown?: AtsScoreBreakdown
  checks?: AtsFormatChecks
}

export interface BulletDiff {
  id: string
  original: string
  tailored: string
  changeType: 'keyword_injected' | 'metric_quantified' | 'verb_strengthened' | 'rephrased' | 'unchanged'
  keywordsInjected?: string[]
  sourceEntityId?: string
  sourceEntityType?: 'experience' | 'project' | 'skill'
  isTraceable: boolean
}

export interface RoleChange {
  roleId: string
  roleTitle: string
  companyName: string
  period?: string
  bullets: BulletDiff[]
}

export interface AuditTrailItem {
  claim: string
  source: string
  status: 'VERIFIED' | 'CAUTION'
}

export interface ChangesData {
  stats: {
    bulletsTailored: number
    totalBullets: number
    keywordsAdded: number
    factGroundingPercent: number
    metricsBoosted: number
  }
  tailoringNotes: string[]
  roleChanges: RoleChange[]
  traceabilityFlags: {
    zeroHallucinations: boolean
    allFactsGrounded: boolean
    auditTrail: AuditTrailItem[]
  }
}

export interface EditableRole {
  id: string
  roleTitle: string
  companyName: string
  period?: string
  bullets: string[]
}

export interface EditableProject {
  id: string
  title: string
  technologies: string
  bullets: string[]
}

export interface TailoredContent {
  summary: string
  experience: EditableRole[]
  skills: Record<string, string[]>
  projects: EditableProject[]
}

export interface ResumeDownloadResponse {
  url?: string
  downloadUrl?: string
  fileName: string
  format: 'pdf' | 'tex'
  expiresAt: string
}

export interface GenerationDetail {
  id: string
  jobTitle?: string
  companyName?: string
  jobText?: string
  jobUrl?: string
  templateId?: string
  templateName?: string
  status: 'QUEUED' | 'ANALYZING' | 'TAILORING' | 'RENDERING' | 'COMPILING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  atsScore?: AtsScoreData
  changes?: ChangesData
  tailoredContent?: TailoredContent
  compiledPdfUrl?: string
  pdfUrl?: string
  latexSource?: string
  pdfUrlExpiresAt?: string
  isOutOfDate?: boolean
}


