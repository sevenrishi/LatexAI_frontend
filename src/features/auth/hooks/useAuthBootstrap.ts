import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { authApi, DEMO_SESSION, DEMO_USER, DEMO_PROFILE } from '../api/authApi'
import { ApiError } from '@/lib/api'

export function useAuthBootstrap() {
  const { setSession, setProfile, clearAuth, setIsLoading } = useAuthStore()

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      try {
        // 1. Check if demo session is active in localStorage
        const demoToken = localStorage.getItem('latexai_demo_token')
        if (demoToken) {
          const userStr = localStorage.getItem('latexai_demo_user')
          const user = userStr ? JSON.parse(userStr) : DEMO_USER
          setSession(DEMO_SESSION, user)
          try {
            const profile = await authApi.getMe()
            if (isMounted) {
              setProfile(profile)
            }
          } catch {
            if (isMounted) {
              setProfile(DEMO_PROFILE)
            }
          } finally {
            if (isMounted) {
              setIsLoading(false)
            }
          }
          return
        }

        // 2. Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          if (isMounted) {
            clearAuth()
          }
          return
        }

        if (isMounted) {
          setSession(session, session.user)
        }

        // 3. Load user identity, onboarding completion, and active template IDs via GET /auth/me
        try {
          const profile = await authApi.getMe()
          if (isMounted) {
            setProfile(profile)
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            if (isMounted) {
              clearAuth()
            }
            return
          }
          // If server is temporarily unreachable, create fallback profile from Supabase user metadata
          if (isMounted) {
            const meta = session.user.user_metadata || {}
            const metaName =
              (meta.full_name as string) ||
              (meta.fullName as string) ||
              (meta.name as string) ||
              (session.user.email
                ? (session.user.email.split('@')[0] || '')
                    .replace(/[._-]/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                : '')
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              fullName: metaName,
              headline: (meta.headline as string) || (meta.target_role as string) || '',
              onboardingCompleted: Boolean(meta.onboarding_completed),
              activeTemplateId: (meta.active_template_id as string) || 'tpl_default_swe',
            })
          }
        }
      } catch (err) {
        console.error('Auth bootstrap failed:', err)
        if (isMounted) {
          clearAuth()
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    // 4. Supabase Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't interfere if demo mode is active
      if (localStorage.getItem('latexai_demo_token')) return

      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          clearAuth()
        }
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (isMounted) {
          setSession(session, session.user)
        }
        try {
          const profile = await authApi.getMe()
          if (isMounted) {
            setProfile(profile)
          }
        } catch {
          // Keep existing profile if refresh fails
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setSession, setProfile, clearAuth, setIsLoading])
}
