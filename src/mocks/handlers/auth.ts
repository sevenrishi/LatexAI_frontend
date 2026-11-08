import { http, HttpResponse } from 'msw'
import { mockProfile } from '../fixtures/profile'

let currentProfile = {
  id: mockProfile.id,
  email: mockProfile.email,
  fullName: mockProfile.fullName,
  headline: 'Senior Full Stack & AI Systems Engineer',
  onboardingCompleted: mockProfile.onboardingCompleted,
  activeTemplateId: 'tpl_default_swe',
  createdAt: '2026-01-15T10:00:00Z',
}

export const authHandlers = [
  http.get('*/health', () => {
    return HttpResponse.json({ status: 'ok', service: 'latexai-api', uptime: 1000 })
  }),

  http.get('*/api/v1/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.patch('*/api/v1/auth/me', async ({ request }) => {
    try {
      const body = (await request.json()) as Partial<typeof currentProfile>
      currentProfile = { ...currentProfile, ...body }
    } catch {
      // ignore
    }
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.put('*/api/v1/auth/me', async ({ request }) => {
    try {
      const body = (await request.json()) as Partial<typeof currentProfile>
      currentProfile = { ...currentProfile, ...body }
    } catch {
      // ignore
    }
    return HttpResponse.json({
      success: true,
      data: currentProfile,
    })
  }),

  http.post('*/api/v1/auth/password', async ({ request }) => {
    let body: { currentPassword?: string; newPassword?: string } = {}
    try {
      body = (await request.json()) as typeof body
    } catch {
      // ignore
    }

    if (body.currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Current password provided is incorrect.',
          },
        },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: { message: 'Password updated successfully' },
    })
  }),

  http.get('*/api/v1/auth/export', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: currentProfile,
        exportedAt: new Date().toISOString(),
        profileKnowledgeBase: mockProfile,
        format: 'JSON_ARCHIVE_V1',
      },
    })
  }),

  http.delete('*/api/v1/auth/account', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Account and associated records successfully purged.' },
    })
  }),

  http.post('*/api/v1/auth/onboarding/complete', () => {
    return HttpResponse.json({
      success: true,
      data: { onboardingCompleted: true },
    })
  }),

  http.post('*/api/v1/auth/demo', () => {
    return HttpResponse.json({
      success: true,
      data: {
        session: {
          access_token: 'mock-demo-access-token-latexai',
          token_type: 'bearer',
          expires_in: 86400,
          user: {
            id: 'usr_demo_456',
            email: 'demo@latexai.dev',
          },
        },
        user: {
          id: 'usr_demo_456',
          email: 'demo@latexai.dev',
        },
      },
    })
  }),
]
