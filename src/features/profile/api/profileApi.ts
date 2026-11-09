import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { parsePdfClientSide } from '../utils/clientPdfParser'
import type {
  FullProfile,
  UpdateProfilePayload,
  ResumeImportDraft,
  ResumeImportConfirmPayload,
  ProfileCompleteness,
  ExperienceItem,
  EducationItem,
  SkillItem,
  CertificationItem,
  ProjectItem,
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

const sectionTableMap: Record<string, string> = {
  experience: 'profile_experience',
  education: 'profile_education',
  skills: 'profile_skills',
  certifications: 'profile_certifications',
  projects: 'profile_projects',
}

const clientToDbMap: Record<string, string> = {
  startDate: 'start_date',
  endDate: 'end_date',
  fieldOfStudy: 'field_of_study',
  sortOrder: 'sort_order',
  issueDate: 'issue_date',
  expiryDate: 'expiry_date',
  doesNotExpire: 'does_not_expire',
  credentialId: 'credential_id',
  credentialUrl: 'credential_url',
  techStack: 'tech_stack',
  repoUrl: 'repo_url',
  liveUrl: 'live_url',
  fullName: 'full_name',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function toValidUuid(id: unknown): string {
  if (typeof id === 'string' && UUID_REGEX.test(id)) return id
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function toDbFields(item: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(item)) {
    if (k === 'id' && typeof v === 'string' && (v.startsWith('sk_') || v.startsWith('exp_') || v.startsWith('edu_') || v.startsWith('cert_') || v.startsWith('proj_') || v.startsWith('item_') || v.startsWith('link_'))) {
      continue
    }
    const dbKey = clientToDbMap[k] || k
    res[dbKey] = v
  }
  return res
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
    // 1. If real Supabase session is active, read directly from Supabase DB
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const user = session.user

        // Direct DB read:
        const { data: rootProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        const [expRes, eduRes, sklRes, certRes, projRes] = await Promise.all([
          supabase
            .from('profile_experience')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('profile_education')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('profile_skills')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('profile_certifications')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('profile_projects')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true }),
        ])

        const meta = user.user_metadata || {}
        let resolvedName =
          rootProfile?.full_name ||
          (meta.full_name as string) ||
          (meta.fullName as string) ||
          (meta.name as string) ||
          (user.email ? user.email.split('@')[0] : '') ||
          ''

        if (resolvedName === 'Alex Rivera' || resolvedName === 'Alex Morgan') {
          resolvedName =
            (meta.full_name as string) ||
            (meta.fullName as string) ||
            (meta.name as string) ||
            (user.email ? user.email.split('@')[0] : '') ||
            ''
        }

        // Deduplicate experience and track duplicate IDs
        const seenExp = new Set<string>()
        const duplicateExpIds: string[] = []
        const experience: ExperienceItem[] = []
        for (const e of (expRes.data || [])) {
          const sig = `${(e.company || '').trim().toLowerCase()}::${(e.title || '').trim().toLowerCase()}`
          if (seenExp.has(sig)) {
            duplicateExpIds.push(e.id)
          } else {
            seenExp.add(sig)
            experience.push({
              id: e.id,
              company: e.company || '',
              title: e.title || '',
              location: e.location || '',
              startDate: e.start_date || '',
              endDate: e.end_date || null,
              current: Boolean(e.current),
              bullets: Array.isArray(e.bullets) ? e.bullets : [],
            })
          }
        }

        // Deduplicate education and track duplicate IDs
        const seenEdu = new Set<string>()
        const duplicateEduIds: string[] = []
        const education: EducationItem[] = []
        for (const e of (eduRes.data || [])) {
          const sig = `${(e.institution || '').trim().toLowerCase()}::${(e.degree || '').trim().toLowerCase()}`
          if (seenEdu.has(sig)) {
            duplicateEduIds.push(e.id)
          } else {
            seenEdu.add(sig)
            education.push({
              id: e.id,
              institution: e.institution || '',
              degree: e.degree || '',
              fieldOfStudy: e.field_of_study || '',
              location: e.location || '',
              startDate: e.start_date || '',
              endDate: e.end_date || '',
              current: Boolean(e.current),
              gpa: e.gpa || '',
              honors: e.honors || '',
            })
          }
        }

        // Deduplicate skills and track duplicate IDs
        const seenSkills = new Set<string>()
        const duplicateSkillIds: string[] = []
        const skills: SkillItem[] = []
        for (const s of (sklRes.data || [])) {
          const sig = (s.name || '').trim().toLowerCase()
          if (seenSkills.has(sig)) {
            duplicateSkillIds.push(s.id)
          } else {
            seenSkills.add(sig)
            skills.push({
              id: s.id,
              name: s.name || '',
              category: s.category || 'Other',
            })
          }
        }

        // Deduplicate certifications and track duplicate IDs
        const seenCerts = new Set<string>()
        const duplicateCertIds: string[] = []
        const certifications: CertificationItem[] = []
        for (const c of (certRes.data || [])) {
          const sig = `${(c.name || '').trim().toLowerCase()}::${(c.issuer || '').trim().toLowerCase()}`
          if (seenCerts.has(sig)) {
            duplicateCertIds.push(c.id)
          } else {
            seenCerts.add(sig)
            certifications.push({
              id: c.id,
              name: c.name || '',
              issuer: c.issuer || '',
              issueDate: c.issue_date || '',
              expiryDate: c.expiry_date || null,
              doesNotExpire: Boolean(c.does_not_expire),
              credentialId: c.credential_id || '',
              credentialUrl: c.credential_url || '',
            })
          }
        }

        // Deduplicate projects and track duplicate IDs
        const seenProj = new Set<string>()
        const duplicateProjIds: string[] = []
        const projects: ProjectItem[] = []
        for (const p of (projRes.data || [])) {
          const sig = (p.title || '').trim().toLowerCase()
          if (seenProj.has(sig)) {
            duplicateProjIds.push(p.id)
          } else {
            seenProj.add(sig)
            projects.push({
              id: p.id,
              title: p.title || '',
              role: p.role || '',
              description: p.description || '',
              techStack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
              liveUrl: p.live_url || '',
              repoUrl: p.repo_url || '',
            })
          }
        }

        // Clean up duplicate rows from Supabase DB asynchronously in the background
        if (duplicateExpIds.length > 0) void supabase.from('profile_experience').delete().in('id', duplicateExpIds)
        if (duplicateEduIds.length > 0) void supabase.from('profile_education').delete().in('id', duplicateEduIds)
        if (duplicateCertIds.length > 0) void supabase.from('profile_certifications').delete().in('id', duplicateCertIds)
        if (duplicateProjIds.length > 0) void supabase.from('profile_projects').delete().in('id', duplicateProjIds)
        if (duplicateSkillIds.length > 0) void supabase.from('profile_skills').delete().in('id', duplicateSkillIds)

        const rawLinks = Array.isArray(rootProfile?.links) ? rootProfile.links : []
        const websiteLink = rawLinks.find((l: any) => l.id === 'website' || l.label?.toLowerCase() === 'website' || l.label?.toLowerCase() === 'portfolio')
        const githubLink = rawLinks.find((l: any) => l.id === 'github' || l.label?.toLowerCase() === 'github')
        const linkedinLink = rawLinks.find((l: any) => l.id === 'linkedin' || l.label?.toLowerCase() === 'linkedin')
        const customLinks = rawLinks.filter((l: any) => !['website', 'github', 'linkedin'].includes(l.id) && !['website', 'github', 'linkedin', 'portfolio'].includes(l.label?.toLowerCase()))

        const profileData: FullProfile = {
          id: user.id,
          email: rootProfile?.email || user.email || '',
          fullName: resolvedName,
          headline: rootProfile?.headline || '',
          phone: rootProfile?.phone || '',
          location: rootProfile?.location || '',
          summary: rootProfile?.summary || '',
          website: rootProfile?.website || (websiteLink ? websiteLink.url : ''),
          github: rootProfile?.github || (githubLink ? githubLink.url : ''),
          linkedin: rootProfile?.linkedin || (linkedinLink ? linkedinLink.url : ''),
          customLinks,
          experience,
          education,
          skills,
          certifications,
          projects,
          onboardingCompleted: Boolean(rootProfile?.onboarding_completed),
          updatedAt: rootProfile?.updated_at || new Date().toISOString(),
          completeness: { percentage: 0, tier: 'needs_work', sections: {} as any, missingSections: [] },
        }

        profileData.completeness = calculateCompleteness(profileData)
        return profileData
      }
    } catch (directErr) {
      console.warn('Direct Supabase getProfile encountered an issue:', directErr)
    }

    // 2. Demo fallback if unauthenticated
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
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const updateObj: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (payload.fullName !== undefined) updateObj.full_name = payload.fullName
        if (payload.headline !== undefined) updateObj.headline = payload.headline
        if (payload.phone !== undefined) updateObj.phone = payload.phone
        if (payload.location !== undefined) updateObj.location = payload.location
        if (payload.summary !== undefined) updateObj.summary = payload.summary

        if (
          payload.website !== undefined ||
          payload.github !== undefined ||
          payload.linkedin !== undefined ||
          payload.customLinks !== undefined
        ) {
          const { data: cur } = await supabase.from('profiles').select('links').eq('id', session.user.id).maybeSingle()
          const curLinks: Array<{ id: string; label: string; url: string }> = Array.isArray(cur?.links) ? cur.links : []
          const websiteUrl = payload.website !== undefined ? payload.website : curLinks.find((l) => l.id === 'website')?.url
          const githubUrl = payload.github !== undefined ? payload.github : curLinks.find((l) => l.id === 'github')?.url
          const linkedinUrl = payload.linkedin !== undefined ? payload.linkedin : curLinks.find((l) => l.id === 'linkedin')?.url

          const newLinks: Array<{ id: string; label: string; url: string }> = []
          if (websiteUrl) newLinks.push({ id: 'website', label: 'Website', url: websiteUrl })
          if (linkedinUrl) newLinks.push({ id: 'linkedin', label: 'LinkedIn', url: linkedinUrl })
          if (githubUrl) newLinks.push({ id: 'github', label: 'GitHub', url: githubUrl })

          const incomingCustom = payload.customLinks !== undefined
            ? payload.customLinks
            : curLinks.filter((l) => !['website', 'github', 'linkedin'].includes(l.id))
          for (const cl of incomingCustom) {
            if (!['website', 'github', 'linkedin'].includes(cl.id)) {
              newLinks.push(cl)
            }
          }
          updateObj.links = newLinks
        }

        await supabase.from('profiles').update(updateObj).eq('id', session.user.id)
      }
    } catch (e) {
      console.warn('Direct profile update warning:', e)
    }

    try {
      await api.patch<FullProfile>('/profile', payload)
    } catch {
      // API call best-effort
    }

    return this.getProfile()
  },

  async updateFullProfile(payload: UpdateProfilePayload): Promise<FullProfile> {
    return this.updateProfile(payload)
  },

  async reorderSection(section: string, itemIds: string[]): Promise<FullProfile> {
    const tableName = sectionTableMap[section]
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && tableName) {
        await Promise.all(
          itemIds.map((id, index) =>
            supabase
              .from(tableName)
              .update({ sort_order: index })
              .eq('id', id)
              .eq('user_id', session.user.id)
          )
        )
      }
    } catch (e) {
      console.warn(`Direct DB reorder for ${section} warning:`, e)
    }

    try {
      await api.patch<FullProfile>(`/profile/${section}/reorder`, {
        orderedIds: itemIds,
        order: itemIds,
      })
    } catch {
      // Fallback
    }
    return this.getProfile()
  },

  async createSectionItem<T = unknown>(section: string, item: unknown): Promise<T> {
    const tableName = sectionTableMap[section]
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && tableName) {
        const dbPayload = toDbFields(item as Record<string, unknown>)
        dbPayload.user_id = session.user.id
        const { data, error } = await supabase
          .from(tableName)
          .insert(dbPayload)
          .select()
          .single()
        if (!error && data) {
          return data as T
        }
      }
    } catch (e) {
      console.warn(`Direct DB insert for ${section} warning:`, e)
    }
    return await api.post<T>(`/profile/${section}`, item)
  },

  async updateSectionItem<T = unknown>(section: string, id: string, item: unknown): Promise<T> {
    const tableName = sectionTableMap[section]
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && tableName) {
        const dbPayload = toDbFields(item as Record<string, unknown>)
        delete dbPayload.id
        delete dbPayload.user_id
        const { data, error } = await supabase
          .from(tableName)
          .update(dbPayload)
          .eq('id', id)
          .eq('user_id', session.user.id)
          .select()
          .single()
        if (!error && data) {
          return data as T
        }
      }
    } catch (e) {
      console.warn(`Direct DB update for ${section} warning:`, e)
    }
    return await api.put<T>(`/profile/${section}/${id}`, item)
  },

  async deleteSectionItem(section: string, id: string): Promise<{ deleted: boolean; id: string }> {
    const tableName = sectionTableMap[section]
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && tableName) {
        await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id)
        return { deleted: true, id }
      }
    } catch (e) {
      console.warn(`Direct DB delete for ${section} warning:`, e)
    }
    return await api.delete<{ deleted: boolean; id: string }>(`/profile/${section}/${id}`)
  },

  async bulkAddSkills(skills: Array<{ name: string; category?: string } | string>): Promise<unknown[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const normalized = skills
          .map((s) => {
            if (typeof s === 'string') return { user_id: session.user.id, name: s.trim(), category: 'Other' }
            return { user_id: session.user.id, name: s.name.trim(), category: s.category || 'Other' }
          })
          .filter((s) => Boolean(s.name))

        const { data } = await supabase
          .from('profile_skills')
          .upsert(normalized, { onConflict: 'user_id,name' })
          .select()
        if (data) return data
      }
    } catch (e) {
      console.warn('Direct DB bulkAddSkills warning:', e)
    }
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

    // 1. Attempt backend upload and AI/heuristic structured parsing
    try {
      const result = await api.post<ResumeImportDraft>('/profile/import-resume', formData)
      if (result && result.parsedData && Object.keys(result.parsedData).length > 0) {
        return result
      }
    } catch (backendErr) {
      console.warn('Backend resume import call failed, parsing directly from PDF:', backendErr)
    }

    // 2. Client-side fallback: extract and parse career knowledge strictly from the uploaded PDF
    try {
      const parsedDraft = await parsePdfClientSide(file)
      return parsedDraft as unknown as ResumeImportDraft
    } catch (clientErr) {
      console.error('Failed to parse text from the uploaded PDF document:', clientErr)
      throw new Error(
        'Failed to parse text from the uploaded resume file. Please ensure it has selectable text.'
      )
    }
  },

  async confirmResumeImport(
    importId: string,
    payload: ResumeImportConfirmPayload
  ): Promise<FullProfile> {
    const imported = payload.overrides || payload.selectedData || {}

    // 1. Primary: Call backend API endpoint to perform authoritative deduplicated DB merge/replace
    let backendSuccess = false
    try {
      const updated = await api.post<FullProfile>(`/profile/import-resume/${importId}/confirm`, payload)
      if (updated && updated.id) {
        backendSuccess = true
        return await this.getProfile()
      }
    } catch (apiErr) {
      console.warn('Backend API resume confirm failed, falling back to direct DB persistence:', apiErr)
    }

    // 2. Fallback: Direct Supabase DB persistence ONLY if the backend call failed
    if (!backendSuccess) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user

      if (user) {
        // Contact & Summary in 'profiles'
        const profileUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (payload.sections?.contact !== false && imported.contact) {
          if (imported.contact.fullName) profileUpdates.full_name = imported.contact.fullName
          if (imported.contact.headline !== undefined) profileUpdates.headline = imported.contact.headline
          if (imported.contact.email) profileUpdates.email = imported.contact.email
          if (imported.contact.phone !== undefined) profileUpdates.phone = imported.contact.phone
          if (imported.contact.location !== undefined) profileUpdates.location = imported.contact.location

          // Update links jsonb
          const { data: cur } = await supabase.from('profiles').select('links').eq('id', user.id).maybeSingle()
          const curLinks: Array<{ id: string; label: string; url: string }> = Array.isArray(cur?.links) ? cur.links : []
          const websiteUrl = imported.contact.website || curLinks.find((l) => l.id === 'website')?.url
          const githubUrl = imported.contact.github || curLinks.find((l) => l.id === 'github')?.url
          const linkedinUrl = imported.contact.linkedin || curLinks.find((l) => l.id === 'linkedin')?.url

          const newLinks: Array<{ id: string; label: string; url: string }> = []
          if (websiteUrl) newLinks.push({ id: 'website', label: 'Website', url: websiteUrl })
          if (linkedinUrl) newLinks.push({ id: 'linkedin', label: 'LinkedIn', url: linkedinUrl })
          if (githubUrl) newLinks.push({ id: 'github', label: 'GitHub', url: githubUrl })

          const custom = curLinks.filter((l) => !['website', 'github', 'linkedin'].includes(l.id))
          for (const cl of custom) {
            newLinks.push(cl)
          }
          profileUpdates.links = newLinks
        }

        if (payload.sections?.summary !== false && imported.summary) {
          profileUpdates.summary = imported.summary
        }

        if (Object.keys(profileUpdates).length > 1) {
          await supabase.from('profiles').update(profileUpdates).eq('id', user.id)
        }

        // Experience
        if (payload.sections?.experience !== false && Array.isArray(imported.experience)) {
          if (payload.strategy === 'replace') {
            await supabase.from('profile_experience').delete().eq('user_id', user.id)
          }
          const { data: curExp } = await supabase.from('profile_experience').select('company, title').eq('user_id', user.id)
          const seenExpKeys = new Set((curExp || []).map((e: any) => `${(e.company || '').trim().toLowerCase()}::${(e.title || '').trim().toLowerCase()}`))

          for (let i = 0; i < imported.experience.length; i++) {
            const exp = imported.experience[i] as any
            const key = `${String(exp.company || '').trim().toLowerCase()}::${String(exp.title || '').trim().toLowerCase()}`
            if (payload.strategy !== 'replace' && seenExpKeys.has(key)) continue
            seenExpKeys.add(key)

            const bullets = (Array.isArray(exp.bullets) ? exp.bullets : []).map((b: any) => ({
              id: toValidUuid(typeof b === 'object' ? b?.id : ''),
              text: typeof b === 'string' ? b : b?.text || '',
            }))
            await supabase.from('profile_experience').insert({
              id: toValidUuid(exp.id),
              user_id: user.id,
              company: exp.company || '',
              title: exp.title || '',
              location: exp.location || '',
              start_date: exp.startDate || exp.start_date || '',
              end_date: exp.endDate || exp.end_date || null,
              current: Boolean(exp.current),
              bullets,
              sort_order: i,
            })
          }
        }

        // Education
        if (payload.sections?.education !== false && Array.isArray(imported.education)) {
          if (payload.strategy === 'replace') {
            await supabase.from('profile_education').delete().eq('user_id', user.id)
          }
          const { data: curEdu } = await supabase.from('profile_education').select('institution, degree').eq('user_id', user.id)
          const seenEduKeys = new Set((curEdu || []).map((e: any) => `${(e.institution || '').trim().toLowerCase()}::${(e.degree || '').trim().toLowerCase()}`))

          for (let i = 0; i < imported.education.length; i++) {
            const edu = imported.education[i] as any
            const key = `${String(edu.institution || '').trim().toLowerCase()}::${String(edu.degree || '').trim().toLowerCase()}`
            if (payload.strategy !== 'replace' && seenEduKeys.has(key)) continue
            seenEduKeys.add(key)

            await supabase.from('profile_education').insert({
              id: toValidUuid(edu.id),
              user_id: user.id,
              institution: edu.institution || '',
              degree: edu.degree || '',
              field_of_study: edu.fieldOfStudy || edu.field_of_study || '',
              location: edu.location || '',
              start_date: edu.startDate || edu.start_date || '',
              end_date: edu.endDate || edu.end_date || '',
              current: Boolean(edu.current),
              gpa: edu.gpa ? String(edu.gpa) : '',
              honors: edu.honors || '',
              sort_order: i,
            })
          }
        }

        // Skills
        if (payload.sections?.skills !== false && Array.isArray(imported.skills)) {
          if (payload.strategy === 'replace') {
            await supabase.from('profile_skills').delete().eq('user_id', user.id)
          }
          const skillRows = imported.skills
            .map((s: any, idx: number) => {
              const name = typeof s === 'string' ? s.trim() : s?.name?.trim() || ''
              const category = typeof s === 'object' && s?.category ? s.category : 'Other'
              return {
                id: toValidUuid(typeof s === 'object' ? s?.id : ''),
                user_id: user.id,
                name,
                category,
                sort_order: idx,
              }
            })
            .filter((s: any) => Boolean(s.name))

          if (skillRows.length > 0) {
            await supabase.from('profile_skills').upsert(skillRows, { onConflict: 'user_id,name' })
          }
        }

        // Certifications
        if (payload.sections?.certifications !== false && Array.isArray(imported.certifications)) {
          if (payload.strategy === 'replace') {
            await supabase.from('profile_certifications').delete().eq('user_id', user.id)
          }
          const { data: curCerts } = await supabase.from('profile_certifications').select('name, issuer').eq('user_id', user.id)
          const seenCertKeys = new Set((curCerts || []).map((c) => `${(c.name || '').trim().toLowerCase()}::${(c.issuer || '').trim().toLowerCase()}`))

          for (let i = 0; i < imported.certifications.length; i++) {
            const cert: any = imported.certifications[i]
            const key = `${String(cert.name || '').trim().toLowerCase()}::${String(cert.issuer || '').trim().toLowerCase()}`
            if (payload.strategy !== 'replace' && seenCertKeys.has(key)) continue
            seenCertKeys.add(key)

            await supabase.from('profile_certifications').insert({
              id: toValidUuid(cert.id),
              user_id: user.id,
              name: cert.name || '',
              issuer: cert.issuer || '',
              issue_date: cert.issueDate || cert.issue_date || '',
              expiry_date: cert.expiryDate || cert.expiry_date || null,
              does_not_expire: Boolean(cert.doesNotExpire ?? cert.does_not_expire),
              credential_id: cert.credentialId || cert.credential_id || '',
              credential_url: cert.credentialUrl || cert.credential_url || '',
              sort_order: i,
            })
          }
        }

        // Projects
        if (payload.sections?.projects !== false && Array.isArray(imported.projects)) {
          if (payload.strategy === 'replace') {
            await supabase.from('profile_projects').delete().eq('user_id', user.id)
          }
          const { data: curProj } = await supabase.from('profile_projects').select('title').eq('user_id', user.id)
          const seenProjKeys = new Set((curProj || []).map((p) => (p.title || '').trim().toLowerCase()))

          for (let i = 0; i < imported.projects.length; i++) {
            const proj: any = imported.projects[i]
            const key = String(proj.title || '').trim().toLowerCase()
            if (payload.strategy !== 'replace' && seenProjKeys.has(key)) continue
            seenProjKeys.add(key)

            const tech_stack = Array.isArray(proj.techStack) ? proj.techStack : Array.isArray(proj.tech_stack) ? proj.tech_stack : []
            await supabase.from('profile_projects').insert({
              id: toValidUuid(proj.id),
              user_id: user.id,
              title: proj.title || '',
              role: proj.role || '',
              description: proj.description || '',
              tech_stack,
              live_url: proj.liveUrl || proj.live_url || '',
              repo_url: proj.repoUrl || proj.repo_url || '',
              sort_order: i,
            })
          }
        }
      }
    } catch (directErr) {
      }
    }

    // 3. Fallback for offline / demo mode
    const isDemo = typeof window !== 'undefined' && Boolean(localStorage.getItem('latexai_demo_token'))
    if (isDemo) {
      const current = getLocalDemoProfile()
      const replaced: FullProfile = {
        ...current,
        ...(payload.sections?.contact !== false && imported.contact ? imported.contact : {}),
        summary: payload.sections?.summary !== false && imported.summary ? imported.summary : current.summary,
        experience: payload.sections?.experience !== false && imported.experience ? imported.experience : current.experience,
        education: payload.sections?.education !== false && imported.education ? imported.education : current.education,
        skills: payload.sections?.skills !== false && imported.skills ? imported.skills : current.skills,
        certifications: payload.sections?.certifications !== false && imported.certifications ? imported.certifications : current.certifications,
        projects: payload.sections?.projects !== false && imported.projects ? imported.projects : current.projects,
        updatedAt: new Date().toISOString(),
      }
      replaced.completeness = calculateCompleteness(replaced)
      saveLocalDemoProfile(replaced)
      return replaced
    }

    return await this.getProfile()
  },

  async discardResumeImport(importId: string): Promise<void> {
    try {
      await api.delete(`/profile/import-resume/${importId}`)
    } catch {
      // noop in offline/demo
    }
  },
}
