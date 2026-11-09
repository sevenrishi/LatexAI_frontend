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
        // 1. Prioritize real Supabase session if authenticated
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!error && session?.user) {
          // Clear any leftover demo data from storage
          localStorage.removeItem('latexai_demo_token')
          localStorage.removeItem('latexai_demo_user')
          localStorage.removeItem('latexai_demo_profile')
          localStorage.removeItem('latexai_demo_profile_full')

          if (isMounted) {
            setSession(session, session.user)
          }

          try {
            const profile = await authApi.getMe()
            if (isMounted && profile) {
              setProfile(profile)
            }
          } catch {
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
          } finally {
            if (isMounted) {
              setIsLoading(false)
            }
          }
          return
        }

        // 2. Fallback: Check if demo session is explicitly active in localStorage
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

        // 3. No session found
        if (isMounted) {
          clearAuth()
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
      if (event === 'SIGNED_OUT' || !session) {
        if (!localStorage.getItem('latexai_demo_token')) {
          if (isMounted) {
            clearAuth()
          }
        }
        return
      }

      // Token rotation only updates session credentials without re-triggering heavy profile queries
      if (event === 'TOKEN_REFRESHED') {
        if (isMounted) {
          setSession(session, session.user)
        }
        return
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        localStorage.removeItem('latexai_demo_token')
        localStorage.removeItem('latexai_demo_user')
        localStorage.removeItem('latexai_demo_profile')
        localStorage.removeItem('latexai_demo_profile_full')

        if (isMounted) {
          setSession(session, session.user)
        }
        try {
          const profile = await authApi.getMe()
          if (isMounted && profile) {
            setProfile(profile)
          }
        } catch {
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
              headline: (meta.headline as string) || '',
              onboardingCompleted: Boolean(meta.onboarding_completed),
              activeTemplateId: (meta.active_template_id as string) || 'tpl_default_swe',
            })
          }
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
