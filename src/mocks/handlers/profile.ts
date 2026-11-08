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

  http.post('*/api/v1/profile/import-resume', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        importId: 'imp_mock_12345',
        fileName: 'resume.pdf',
        fileSize: 104200,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        parsedData: {
          contact: {
            fullName: 'Alex Morgan',
            headline: 'Staff Distributed Systems Architect',
            email: 'alex.morgan@example.com',
            phone: '+1 (555) 019-2834',
            location: 'San Francisco, CA',
          },
          summary: 'Accomplished engineer specializing in distributed systems.',
          experience: [
            {
              id: 'exp_imp_1',
              company: 'CloudScale Inc',
              title: 'Staff Architect',
              startDate: '2023-01',
              endDate: null,
              current: true,
              bullets: [
                { id: 'b_imp_1', text: 'Architected Kubernetes clusters across 3 multi-cloud zones.' },
              ],
            },
          ],
          education: [],
          skills: [
            { id: 'sk_imp_1', name: 'Kubernetes', category: 'DevOps' },
            { id: 'sk_imp_2', name: 'Go', category: 'Languages' },
          ],
          certifications: [
            {
              id: 'cert_imp_1',
              name: 'CKA: Certified Kubernetes Administrator',
              issuer: 'CNCF',
              issueDate: '2023-05',
              doesNotExpire: false,
            },
          ],
          projects: [],
        },
      },
    })
  }),

  http.post('*/api/v1/profile/import-resume/:importId/confirm', async () => {
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
