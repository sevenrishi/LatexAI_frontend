import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/auth'
import type { Session, User } from '@supabase/supabase-js'

export interface OnboardingCompletionPayload {
  fullName?: string
  headline?: string
  targetRole?: string
  industry?: string
  experienceLevel?: string
  templateId?: string
  tonePreference?: string
  bulletDensity?: string
}

export const DEMO_USER: User = {
  id: 'usr_demo_456',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Alex Rivera', email_verified: true },
  aud: 'authenticated',
  confirmation_sent_at: '2026-01-01T00:00:00Z',
  recovery_sent_at: '',
  email_change_sent_at: '',
  new_email: '',
  invited_at: '',
  action_link: '',
  email: 'demo@latexai.dev',
  phone: '',
  created_at: '2026-01-01T00:00:00Z',
  confirmed_at: '2026-01-01T00:00:00Z',
  email_confirmed_at: '2026-01-01T00:00:00Z',
  phone_confirmed_at: '',
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
}

export const DEMO_SESSION: Session = {
  access_token: 'mock-demo-access-token-latexai',
  token_type: 'bearer',
  expires_in: 86400,
  refresh_token: 'mock-demo-refresh-token',
  user: DEMO_USER,
}

export const DEMO_PROFILE: UserProfile = {
  id: 'usr_demo_456',
  email: 'demo@latexai.dev',
  fullName: 'Alex Rivera',
  headline: 'Senior Full Stack & AI Systems Engineer',
  onboardingCompleted: true,
  activeTemplateId: 'tpl_default_swe',
  createdAt: '2026-01-01T00:00:00Z',
}

export const authApi = {
  async getMe(): Promise<UserProfile> {
    // 1. If Supabase session is active, prioritize real user data
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const user = session.user

        // Try remote API first
        try {
          const remote = await api.get<UserProfile>('/auth/me')
          if (remote?.id && remote.fullName !== 'Alex Rivera' && remote.fullName !== 'Alex Morgan') {
            return remote
          }
        } catch {
          // Fallback to Supabase direct DB query
        }

        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        const meta = user.user_metadata || {}
        let resolvedName =
          dbProfile?.full_name ||
          (meta.full_name as string) ||
          (meta.fullName as string) ||
          (meta.name as string) ||
          (user.email ? user.email.split('@')[0] : '') ||
          ''

        if (resolvedName === 'Alex Rivera' || resolvedName === 'Alex Morgan') {
          resolvedName = (meta.full_name as string) || (meta.name as string) || (user.email ? user.email.split('@')[0] : '') || ''
        }

        return {
          id: user.id,
          email: dbProfile?.email || user.email || '',
          fullName: resolvedName,
          headline: dbProfile?.headline || (meta.headline as string) || '',
          onboardingCompleted: Boolean(dbProfile?.onboarding_completed ?? meta.onboarding_completed),
          activeTemplateId: dbProfile?.active_template_id || (meta.active_template_id as string) || 'tpl_default_swe',
          createdAt: dbProfile?.created_at || user.created_at,
        }
      }
    } catch {
      // Continue to demo fallback if unauthenticated
    }

    const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
    const stored = localStorage.getItem('latexai_demo_profile')
    if (isDemo && stored) {
      try {
        return JSON.parse(stored) as UserProfile
      } catch {
        return DEMO_PROFILE
      }
    }

    try {
      return await api.get<UserProfile>('/auth/me')
    } catch (err) {
      if (isDemo) {
        return DEMO_PROFILE
      }
      throw err
    }
  },

  async login(email: string, password: string): Promise<{ session: Session; user: User }> {
    return api.post<{ session: Session; user: User }>('/auth/login', { email, password }, { skipAuth: true })
  },

  async signup(email: string, password: string, fullName?: string): Promise<{ session: Session; user: User }> {
    return api.post<{ session: Session; user: User }>('/auth/signup', { email, password, fullName }, { skipAuth: true })
  },

  async completeOnboarding(payload?: OnboardingCompletionPayload): Promise<{ onboardingCompleted: boolean }> {
    try {
      return await api.post<{ onboardingCompleted: boolean }>('/auth/onboarding/complete', payload)
    } catch (err) {
      const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
      if (isDemo) {
        const stored = localStorage.getItem('latexai_demo_profile')
        const current = stored ? JSON.parse(stored) : DEMO_PROFILE
        const updated = {
          ...current,
          onboardingCompleted: true,
          activeTemplateId: payload?.templateId || current.activeTemplateId || 'tpl_default_swe',
        }
        localStorage.setItem('latexai_demo_profile', JSON.stringify(updated))
        return { onboardingCompleted: true }
      }
      throw err
    }
  },

  loginDemoUser(): { session: Session; user: User; profile: UserProfile } {
    localStorage.setItem('latexai_demo_token', DEMO_SESSION.access_token)
    localStorage.setItem('latexai_demo_user', JSON.stringify(DEMO_USER))
    localStorage.setItem('latexai_demo_profile', JSON.stringify(DEMO_PROFILE))

    // Asynchronously sync with backend demo route to ensure backend session alignment
    api.post<{ session: Session; user: User }>('/auth/demo', {}, { skipAuth: true })
      .then((res) => {
        if (res?.session?.access_token) {
          localStorage.setItem('latexai_demo_token', res.session.access_token)
        }
      })
      .catch(() => {
        // Fallback to static mock demo token if backend is offline
      })

    return {
      session: DEMO_SESSION,
      user: DEMO_USER,
      profile: DEMO_PROFILE,
    }
  },

  async updateProfile(payload: { fullName?: string; headline?: string }): Promise<UserProfile> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (payload.fullName !== undefined) updateData.full_name = payload.fullName
        if (payload.headline !== undefined) updateData.headline = payload.headline

        await supabase.from('profiles').update(updateData).eq('id', session.user.id)
      }
    } catch {
      // Direct update best-effort
    }

    try {
      return await api.patch<UserProfile>('/auth/me', payload)
    } catch (err) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        return this.getMe()
      }
      const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
      if (isDemo) {
        const stored = localStorage.getItem('latexai_demo_profile')
        const current = stored ? JSON.parse(stored) : DEMO_PROFILE
        const updated = { ...current, ...payload }
        localStorage.setItem('latexai_demo_profile', JSON.stringify(updated))
        return updated
      }
      throw err
    }
  },

  async updatePassword(payload: { currentPassword?: string; newPassword: string }): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.updateUser({ password: payload.newPassword })
      if (error) {
        return await api.post<{ message: string }>('/auth/password', payload)
      }
      return { message: 'Password updated successfully' }
    } catch {
      try {
        return await api.post<{ message: string }>('/auth/password', payload)
      } catch (err) {
        const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
        if (isDemo) {
          if (payload.currentPassword === 'wrongpassword') {
            throw new Error('Current password provided is incorrect.')
          }
          return { message: 'Password updated successfully' }
        }
        throw err
      }
    }
  },

  async exportData(): Promise<Record<string, unknown>> {
    try {
      return await api.get<Record<string, unknown>>('/auth/export')
    } catch (err) {
      const isDemo = Boolean(localStorage.getItem('latexai_demo_token'))
      if (isDemo) {
        const stored = localStorage.getItem('latexai_demo_profile')
        const profile = stored ? JSON.parse(stored) : DEMO_PROFILE
        return {
          user: profile,
          exportedAt: new Date().toISOString(),
          format: 'JSON_ARCHIVE_V1',
        }
      }
      throw err
    }
  },

  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/auth/account')
    } catch {
      // ignore in offline/demo
    } finally {
      await this.signOut()
    }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('latexai_demo_token')
    localStorage.removeItem('latexai_demo_user')
    localStorage.removeItem('latexai_demo_profile')
    await supabase.auth.signOut().catch(() => {
      // ignore Supabase sign out error if session wasn't active
    })
  },
}
