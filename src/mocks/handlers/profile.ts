import { http, HttpResponse } from 'msw'
import { mockProfile } from '../fixtures/profile'
import type { FullProfile } from '@/types/profile'

let currentProfile: FullProfile = { ...mockProfile }

export const profileHandlers = [
  http.get('*/api/v1/profile', () => {
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.patch('*/api/v1/profile', async ({ request }) => {
    const body = (await request.json()) as Partial<FullProfile>
    currentProfile = {
      ...currentProfile,
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.patch('*/api/v1/profile/:section/reorder', async () => {
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.post('*/api/v1/profile/import-resume', async ({ request }) => {
    let fileName = 'resume.pdf'
    let fileSize = 104200
    try {
      const formData = await request.formData()
      const file = (formData.get('file') || formData.get('resume')) as File | null
      if (file) {
        fileName = file.name
        fileSize = file.size
      }
    } catch {
      // Continue
    }

    const candidateName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

    return HttpResponse.json({
      success: true,
      data: {
        importId: `imp_${Date.now()}`,
        fileName,
        fileSize,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        parsedData: {
          contact: {
            fullName: candidateName,
            headline: '',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: '',
            github: '',
          },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          certifications: [],
          projects: [],
        },
      },
    })
  }),

  http.post('*/api/v1/profile/import-resume/:importId/confirm', async ({ request }) => {
    const body = (await request.json()) as any
    const imported = body.overrides || body.selectedData || {}
    const sections = body.sections || {}
    const strategy = body.strategy || 'merge'

    if (sections.contact !== false && imported.contact) {
      currentProfile = {
        ...currentProfile,
        fullName: imported.contact.fullName || currentProfile.fullName,
        headline: imported.contact.headline !== undefined ? imported.contact.headline : currentProfile.headline,
        phone: imported.contact.phone !== undefined ? imported.contact.phone : currentProfile.phone,
        location: imported.contact.location !== undefined ? imported.contact.location : currentProfile.location,
        website: imported.contact.website !== undefined ? imported.contact.website : currentProfile.website,
        linkedin: imported.contact.linkedin !== undefined ? imported.contact.linkedin : currentProfile.linkedin,
        github: imported.contact.github !== undefined ? imported.contact.github : currentProfile.github,
      }
    }

    if (sections.summary !== false && imported.summary) {
      currentProfile = { ...currentProfile, summary: imported.summary }
    }

    if (sections.experience !== false && Array.isArray(imported.experience)) {
      currentProfile = {
        ...currentProfile,
        experience: strategy === 'replace' ? imported.experience : [...imported.experience, ...currentProfile.experience],
      }
    }

    if (sections.education !== false && Array.isArray(imported.education)) {
      currentProfile = {
        ...currentProfile,
        education: strategy === 'replace' ? imported.education : [...imported.education, ...currentProfile.education],
      }
    }

    if (sections.skills !== false && Array.isArray(imported.skills)) {
      currentProfile = {
        ...currentProfile,
        skills: strategy === 'replace' ? imported.skills : [...imported.skills, ...currentProfile.skills],
      }
    }

    if (sections.certifications !== false && Array.isArray(imported.certifications)) {
      currentProfile = {
        ...currentProfile,
        certifications: strategy === 'replace' ? imported.certifications : [...imported.certifications, ...currentProfile.certifications],
      }
    }

    if (sections.projects !== false && Array.isArray(imported.projects)) {
      currentProfile = {
        ...currentProfile,
        projects: strategy === 'replace' ? imported.projects : [...imported.projects, ...currentProfile.projects],
      }
    }

    currentProfile.updatedAt = new Date().toISOString()
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.delete('*/api/v1/profile/import-resume/:importId', async () => {
    return HttpResponse.json({
      success: true,
      data: { discarded: true },
    })
  }),
]
