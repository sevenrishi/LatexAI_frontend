export interface ExperienceBullet {
  id: string
  text: string
}

export interface ExperienceItem {
  id: string
  company: string
  title: string
  location?: string
  startDate: string // YYYY-MM
  endDate?: string | null // YYYY-MM or null/empty if current
  current: boolean
  bullets: ExperienceBullet[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  fieldOfStudy?: string
  location?: string
  startDate: string // YYYY-MM
  endDate?: string // YYYY-MM
  current?: boolean
  gpa?: string
  honors?: string
}

export interface SkillItem {
  id: string
  name: string
  category: 'Languages' | 'Frontend' | 'Backend' | 'Databases' | 'DevOps' | 'Tools' | 'Other' | string
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  issueDate: string // YYYY-MM
  expiryDate?: string | null
  doesNotExpire?: boolean
  credentialId?: string
  credentialUrl?: string
}

export interface ProjectItem {
  id: string
  title: string
  role?: string
  description: string
  techStack: string[]
  liveUrl?: string
  repoUrl?: string
}

export interface ProfileLink {
  id: string
  label: string
  url: string
}

export interface ProfileCompleteness {
  percentage: number
  tier: 'needs_work' | 'good' | 'strong'
  sections: {
    contact: boolean
    summary: boolean
    experience: boolean
    education: boolean
    skills: boolean
    certifications: boolean
    projects: boolean
  }
  missingSections: string[]
}

export interface FullProfile {
  id: string
  email: string
  fullName: string
  headline: string
  phone: string
  location: string
  summary: string
  website?: string
  github?: string
  linkedin?: string
  customLinks?: ProfileLink[]
  completeness: ProfileCompleteness
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillItem[]
  certifications: CertificationItem[]
  projects: ProjectItem[]
  onboardingCompleted?: boolean
  updatedAt?: string
}

export interface UpdateProfilePayload {
  fullName?: string
  email?: string
  headline?: string
  phone?: string
  location?: string
  summary?: string
  website?: string
  github?: string
  linkedin?: string
  customLinks?: ProfileLink[]
  experience?: ExperienceItem[]
  education?: EducationItem[]
  skills?: SkillItem[]
  certifications?: CertificationItem[]
  projects?: ProjectItem[]
}

export interface ResumeImportParsedData {
  contact?: {
    fullName?: string
    headline?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
  }
  summary?: string
  experience?: ExperienceItem[]
  education?: EducationItem[]
  skills?: SkillItem[]
  certifications?: CertificationItem[]
  projects?: ProjectItem[]
}

export interface ResumeImportDraft {
  importId: string
  fileName: string
  fileSize: number
  parsedData: ResumeImportParsedData
  expiresAt: string
}

export interface ResumeImportConfirmPayload {
  strategy: 'merge' | 'replace'
  sections: {
    contact: boolean
    summary: boolean
    experience: boolean
    education: boolean
    skills: boolean
    certifications: boolean
    projects: boolean
  }
  overrides?: ResumeImportParsedData
  selectedData?: ResumeImportParsedData
}
