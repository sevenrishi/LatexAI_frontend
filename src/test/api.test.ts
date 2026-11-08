import { describe, it, expect } from 'vitest'
import { api, ApiError } from '@/lib/api'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('API Client & MSW Mock Harness', () => {
  it('successfully fetches and unwraps profile envelope', async () => {
    const profile = await api.get<{ fullName: string }>('/profile')
    expect(profile).toBeDefined()
    expect(profile.fullName).toBe('Alex Morgan')
  })

  it('handles ApiError on 404 or server error responses', async () => {
    server.use(
      http.get('*/api/v1/test-error-404', () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Custom not found error',
            },
          },
          { status: 404 }
        )
      })
    )

    try {
      await api.get('/test-error-404')
      expect.fail('Should have thrown an ApiError')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(404)
      expect(apiErr.code).toBe('NOT_FOUND')
    }
  })
})
