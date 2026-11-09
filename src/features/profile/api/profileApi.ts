import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
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

        const experience: ExperienceItem[] = (expRes.data || []).map((e: any) => ({
          id: e.id,
          company: e.company || '',
          title: e.title || '',
          location: e.location || '',
          startDate: e.start_date || '',
          endDate: e.end_date || null,
          current: Boolean(e.current),
          bullets: Array.isArray(e.bullets) ? e.bullets : [],
          sortOrder: e.sort_order ?? 0,
        }))

        const education: EducationItem[] = (eduRes.data || []).map((e: any) => ({
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
          sortOrder: e.sort_order ?? 0,
        }))

        const skills: SkillItem[] = (sklRes.data || []).map((s: any) => ({
          id: s.id,
          name: s.name || '',
          category: s.category || 'Other',
          sortOrder: s.sort_order ?? 0,
        }))

        const certifications: CertificationItem[] = (certRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.name || '',
          issuer: c.issuer || '',
          issueDate: c.issue_date || '',
          expiryDate: c.expiry_date || null,
          doesNotExpire: Boolean(c.does_not_expire),
          credentialId: c.credential_id || '',
          credentialUrl: c.credential_url || '',
          sortOrder: c.sort_order ?? 0,
        }))

        const projects: ProjectItem[] = (projRes.data || []).map((p: any) => ({
          id: p.id,
          title: p.title || '',
          role: p.role || '',
          description: p.description || '',
          techStack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
          liveUrl: p.live_url || '',
          repoUrl: p.repo_url || '',
          sortOrder: p.sort_order ?? 0,
        }))

        const profileData: FullProfile = {
          id: user.id,
          email: rootProfile?.email || user.email || '',
          fullName: resolvedName,
          headline: rootProfile?.headline || '',
          phone: rootProfile?.phone || '',
          location: rootProfile?.location || '',
          summary: rootProfile?.summary || '',
          website: rootProfile?.website || '',
          github: rootProfile?.github || '',
          linkedin: rootProfile?.linkedin || '',
          customLinks: Array.isArray(rootProfile?.links) ? rootProfile.links : [],
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
        if (payload.website !== undefined) updateObj.website = payload.website
        if (payload.github !== undefined) updateObj.github = payload.github
        if (payload.linkedin !== undefined) updateObj.linkedin = payload.linkedin
        if (payload.customLinks !== undefined) updateObj.links = payload.customLinks

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
