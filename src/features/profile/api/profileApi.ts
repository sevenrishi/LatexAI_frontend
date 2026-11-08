import { api } from '@/lib/api'
import type {
  FullProfile,
  UpdateProfilePayload,
  ResumeImportDraft,
  ResumeImportConfirmPayload,
  ProfileCompleteness,
} from '@/types/profile'

export function calculateCompleteness(profile: Partial<FullProfile>): ProfileCompleteness {
  const sections = {
    contact: Boolean(profile.fullName && profile.email && profile.phone && profile.location),
    summary: Boolean(profile.summary && profile.summary.trim().length >= 30),
    experience: Boolean(profile.experience && profile.experience.length > 0),
    education: Boolean(profile.education && profile.education.length > 0),
    skills: Boolean(profile.skills && profile.skills.length >= 4),
    projects: Boolean(profile.projects && profile.projects.length > 0),
    certifications: Boolean(profile.certifications && profile.certifications.length > 0),
  }

  let percentage = 0
  if (sections.contact) percentage += 15
  if (sections.summary) percentage += 15
  if (sections.experience) percentage += 25
  if (sections.education) percentage += 15
  if (sections.skills) percentage += 15
  if (sections.projects) percentage += 10
  if (sections.certifications) percentage += 5

  const missingSections: string[] = []
  if (!sections.contact) missingSections.push('Contact info')
  if (!sections.summary) missingSections.push('Summary')
  if (!sections.experience) missingSections.push('Experience')
  if (!sections.education) missingSections.push('Education')
  if (!sections.skills) missingSections.push('Skills')
  if (!sections.projects) missingSections.push('Projects')
  if (!sections.certifications) missingSections.push('Certifications')

  const tier: 'needs_work' | 'good' | 'strong' =
    percentage >= 85 ? 'strong' : percentage >= 60 ? 'good' : 'needs_work'

  return {
    percentage,
    tier,
    sections,
    missingSections,
  }
}

export const INITIAL_DEMO_FULL_PROFILE: FullProfile = {
  id: 'usr_demo_456',
  email: 'alex.morgan@example.com',
  fullName: 'Alex Morgan',
  headline: 'Senior Full Stack Engineer & Distributed Systems Lead',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA',
  summary:
    'Results-driven software engineer with 7+ years of experience architecting high-throughput distributed systems and responsive React web applications. Proven track record leading cross-functional teams and accelerating release cycles.',
  website: 'https://alexmorgan.dev',
  github: 'https://github.com/alexmorgan',
  linkedin: 'https://linkedin.com/in/alexmorgan',
  customLinks: [
    { id: 'link_1', label: 'Tech Blog', url: 'https://alexmorgan.dev/blog' },
  ],
  completeness: {
    percentage: 85,
    tier: 'strong',
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: false,
    },
    missingSections: ['Certifications'],
  },
  skills: [
    { id: 'sk_1', name: 'TypeScript', category: 'Languages' },
    { id: 'sk_2', name: 'React', category: 'Frontend' },
    { id: 'sk_3', name: 'Node.js', category: 'Backend' },
    { id: 'sk_4', name: 'PostgreSQL', category: 'Databases' },
    { id: 'sk_5', name: 'Docker', category: 'DevOps' },
    { id: 'sk_6', name: 'LaTeX', category: 'Tools' },
    { id: 'sk_7', name: 'Tailwind CSS', category: 'Frontend' },
    { id: 'sk_8', name: 'Go', category: 'Languages' },
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'TechCorp Solutions',
      title: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: null,
      current: true,
      bullets: [
        { id: 'b_1', text: 'Architected event-driven microservices handling 50M+ requests/day with 99.99% uptime.' },
        { id: 'b_2', text: 'Mentored 6 junior engineers and led migration from monolith to modular services.' },
        { id: 'b_3', text: 'Reduced p99 API response latencies by 42% through Redis caching and query indexing.' },
      ],
    },
    {
      id: 'exp_2',
      company: 'DataFlow Systems',
      title: 'Software Engineer',
      location: 'Austin, TX',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      bullets: [
        { id: 'b_4', text: 'Developed full-stack analytics dashboards used by 12,000+ enterprise clients.' },
        { id: 'b_5', text: 'Constructed real-time WebSocket ingestion pipeline processing 10k messages/sec.' },
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2015-08',
      endDate: '2019-05',
      gpa: '3.85',
      honors: 'Summa Cum Laude, Dean’s Honor List',
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-04',
      expiryDate: '2026-04',
      doesNotExpire: false,
      credentialId: 'AWS-839210-AS',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'Distributed Task Queue (Go & Redis)',
      role: 'Creator & Maintainer',
      description: 'Open-source distributed background job processor with automated retries, dead-letter queues, and real-time dashboard.',
      techStack: ['Go', 'Redis', 'React', 'Docker'],
      liveUrl: 'https://github.com/alexmorgan/task-queue',
      repoUrl: 'https://github.com/alexmorgan/task-queue',
    },
  ],
}

function getLocalDemoProfile(): FullProfile {
  const stored = localStorage.getItem('latexai_demo_profile_full')
  if (stored) {
    try {
      return JSON.parse(stored) as FullProfile
    } catch {
      return INITIAL_DEMO_FULL_PROFILE
    }
  }
  return INITIAL_DEMO_FULL_PROFILE
}

function saveLocalDemoProfile(profile: FullProfile): void {
  localStorage.setItem('latexai_demo_profile_full', JSON.stringify(profile))
}

export const profileApi = {
  async getProfile(): Promise<FullProfile> {
    const isDemo = typeof window !== 'undefined' && Boolean(localStorage.getItem('latexai_demo_token'))
    try {
      const data = await api.get<FullProfile>('/profile')
      if (data) {
        return {
          ...data,
          completeness: calculateCompleteness(data),
        }
      }
      if (isDemo) return getLocalDemoProfile()
      throw new Error('Failed to retrieve profile data')
    } catch (err) {
      if (isDemo) return getLocalDemoProfile()
      throw err
    }
  },

  async getFullProfile(): Promise<FullProfile> {
    return this.getProfile()
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<FullProfile> {
    const isDemo = typeof window !== 'undefined' && Boolean(localStorage.getItem('latexai_demo_token'))
    try {
      const data = await api.patch<FullProfile>('/profile', payload)
      return {
        ...data,
        completeness: calculateCompleteness(data),
      }
    } catch (err) {
      if (isDemo) {
        const current = getLocalDemoProfile()
        const updated: FullProfile = {
          ...current,
          ...payload,
          updatedAt: new Date().toISOString(),
        }
        updated.completeness = calculateCompleteness(updated)
        saveLocalDemoProfile(updated)
        return updated
      }
      throw err
    }
  },

  async updateFullProfile(payload: UpdateProfilePayload): Promise<FullProfile> {
    return this.updateProfile(payload)
  },

  async reorderSection(section: string, itemIds: string[]): Promise<FullProfile> {
    try {
      return await api.patch<FullProfile>(`/profile/${section}/reorder`, {
        orderedIds: itemIds,
        order: itemIds,
      })
    } catch {
      const current = getLocalDemoProfile()
      if (section === 'skills') {
        const map = new Map(current.skills.map((s) => [s.id, s]))
        current.skills = itemIds.map((id) => map.get(id)!).filter(Boolean)
      } else if (section === 'experience') {
        const map = new Map(current.experience.map((e) => [e.id, e]))
        current.experience = itemIds.map((id) => map.get(id)!).filter(Boolean)
      }
      saveLocalDemoProfile(current)
      return current
    }
  },

  async createSectionItem<T = unknown>(section: string, item: unknown): Promise<T> {
    return await api.post<T>(`/profile/${section}`, item)
  },

  async updateSectionItem<T = unknown>(section: string, id: string, item: unknown): Promise<T> {
    return await api.put<T>(`/profile/${section}/${id}`, item)
  },

  async deleteSectionItem(section: string, id: string): Promise<{ deleted: boolean; id: string }> {
    return await api.delete<{ deleted: boolean; id: string }>(`/profile/${section}/${id}`)
  },

  async bulkAddSkills(skills: Array<{ name: string; category?: string } | string>): Promise<unknown[]> {
    return await api.post<unknown[]>('/profile/skills/bulk', { skills })
  },

  async uploadResumeImport(file: File): Promise<ResumeImportDraft> {
    // Client-side validation: PDF/DOCX <= 5MB
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    const validExtensions = ['.pdf', '.docx', '.doc']
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!validTypes.includes(file.type) && !hasValidExt) {
      throw new Error('Unsupported format. Please upload a PDF or DOCX resume document.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File exceeds maximum size of 5 MB.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('resume', file)

    try {
      return await api.post<ResumeImportDraft>('/profile/import-resume', formData)
    } catch {
      // Simulate realistic parsed resume draft for demo/offline fallback
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return {
        importId: `imp_${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        parsedData: {
          contact: {
            fullName: 'Alex Morgan',
            headline: 'Lead Cloud & Systems Architect',
            email: 'alex.morgan@example.com',
            phone: '+1 (555) 019-2834',
            location: 'San Francisco, CA',
            website: 'https://alexmorgan.dev',
            github: 'https://github.com/alexmorgan',
            linkedin: 'https://linkedin.com/in/alexmorgan',
          },
          summary:
            'Innovative systems architect and principal engineer with over 8 years of distributed systems engineering, cloud-native deployments, and high-velocity team leadership.',
          experience: [
            {
              id: `exp_imp_${Date.now()}_1`,
              company: 'ScaleGrid Systems',
              title: 'Staff Infrastructure Architect',
              location: 'San Francisco, CA',
              startDate: '2023-01',
              endDate: null,
              current: true,
              bullets: [
                { id: `b_${Date.now()}_1`, text: 'Spearheaded Kubernetes cluster orchestration spanning 400+ nodes across multiple AWS regions.' },
                { id: `b_${Date.now()}_2`, text: 'Standardized infrastructure-as-code using Terraform, slashing provisioning turnaround by 65%.' },
              ],
            },
          ],
          education: [
            {
              id: `edu_imp_${Date.now()}_1`,
              institution: 'UC Berkeley',
              degree: 'B.S. Computer Science',
              fieldOfStudy: 'Computer Science',
              location: 'Berkeley, CA',
              startDate: '2015-08',
              endDate: '2019-05',
              gpa: '3.85',
              honors: 'Dean’s Honors',
            },
          ],
          skills: [
            { id: `sk_imp_1`, name: 'Kubernetes', category: 'DevOps' },
            { id: `sk_imp_2`, name: 'Terraform', category: 'DevOps' },
            { id: `sk_imp_3`, name: 'Go', category: 'Languages' },
            { id: `sk_imp_4`, name: 'Distributed Systems', category: 'Backend' },
            { id: `sk_imp_5`, name: 'gRPC', category: 'Backend' },
          ],
          certifications: [
            {
              id: `cert_imp_1`,
              name: 'CKA: Certified Kubernetes Administrator',
              issuer: 'Cloud Native Computing Foundation',
              issueDate: '2023-08',
              expiryDate: '2026-08',
              doesNotExpire: false,
              credentialId: 'CKA-992019',
              credentialUrl: 'https://cncf.io/cert/CKA-992019',
            },
          ],
          projects: [
            {
              id: `proj_imp_1`,
              title: 'Multi-Region Service Mesh Orchestrator',
              role: 'Lead Architect',
              description: 'Envoy-based traffic router synchronizing cross-datacenter failover with zero packet loss.',
              techStack: ['Go', 'Envoy', 'Kubernetes'],
              liveUrl: 'https://github.com/alexmorgan/service-mesh',
              repoUrl: 'https://github.com/alexmorgan/service-mesh',
            },
          ],
        },
      }
    }
  },

  async confirmResumeImport(
    importId: string,
    payload: ResumeImportConfirmPayload
  ): Promise<FullProfile> {
    try {
      return await api.post<FullProfile>(`/profile/import-resume/${importId}/confirm`, payload)
    } catch {
      // Local fallback: apply merge or replace to local profile
      const current = getLocalDemoProfile()
      const imported = payload.overrides || {}

      if (payload.strategy === 'replace') {
        const replaced: FullProfile = {
          ...current,
          ...(payload.sections.contact && imported.contact ? imported.contact : {}),
          summary: payload.sections.summary && imported.summary ? imported.summary : current.summary,
          experience: payload.sections.experience && imported.experience ? imported.experience : current.experience,
          education: payload.sections.education && imported.education ? imported.education : current.education,
          skills: payload.sections.skills && imported.skills ? imported.skills : current.skills,
          certifications: payload.sections.certifications && imported.certifications ? imported.certifications : current.certifications,
          projects: payload.sections.projects && imported.projects ? imported.projects : current.projects,
          updatedAt: new Date().toISOString(),
        }
        replaced.completeness = calculateCompleteness(replaced)
        saveLocalDemoProfile(replaced)
        return replaced
      }

      // Merge strategy:
      const merged: FullProfile = {
        ...current,
        ...(payload.sections.contact && imported.contact ? imported.contact : {}),
        summary: payload.sections.summary && imported.summary ? imported.summary : current.summary,
        experience: payload.sections.experience && imported.experience
          ? [...(imported.experience || []), ...current.experience]
          : current.experience,
        education: payload.sections.education && imported.education
          ? [...(imported.education || []), ...current.education]
          : current.education,
        skills: payload.sections.skills && imported.skills
          ? [
              ...current.skills,
              ...imported.skills.filter(
                (is) => !current.skills.some((cs) => cs.name.toLowerCase() === is.name.toLowerCase())
              ),
            ]
          : current.skills,
        certifications: payload.sections.certifications && imported.certifications
          ? [...(imported.certifications || []), ...current.certifications]
          : current.certifications,
        projects: payload.sections.projects && imported.projects
          ? [...(imported.projects || []), ...current.projects]
          : current.projects,
        updatedAt: new Date().toISOString(),
      }
      merged.completeness = calculateCompleteness(merged)
      saveLocalDemoProfile(merged)
      return merged
    }
  },

  async discardResumeImport(importId: string): Promise<void> {
    try {
      await api.delete(`/profile/import-resume/${importId}`)
    } catch {
      // noop in offline/demo
    }
  },
}
