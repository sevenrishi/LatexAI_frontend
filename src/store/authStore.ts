import { create } from 'zustand'
import type { AuthState, UserProfile } from '@/types/auth'
import type { Session, User } from '@supabase/supabase-js'

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  onboardingCompleted: false,
  isLoading: true,

  setSession: (session: Session | null, user?: User | null) => {
    const resolvedUser = user !== undefined ? user : session?.user ?? null
    let isCachedOnboarded = false
    if (resolvedUser?.id) {
      try {
        isCachedOnboarded = Boolean(
          resolvedUser.user_metadata?.onboarding_completed ||
          localStorage.getItem(`latexai_onboarded_${resolvedUser.id}`) === 'true'
        )
      } catch {}
    }

    set((state) => ({
      session,
      user: resolvedUser,
      onboardingCompleted: state.onboardingCompleted || isCachedOnboarded,
      isLoading: session ? (isCachedOnboarded || state.profile ? false : state.isLoading) : false,
    }))
  },

  setProfile: (profile: UserProfile | null) => {
    let isCompleted = Boolean(profile?.onboardingCompleted)
    if (profile?.id) {
      try {
        if (!isCompleted && localStorage.getItem(`latexai_onboarded_${profile.id}`) === 'true') {
          isCompleted = true
        } else if (isCompleted) {
          localStorage.setItem(`latexai_onboarded_${profile.id}`, 'true')
        }
      } catch {}
    }

    set({
      profile: profile ? { ...profile, onboardingCompleted: isCompleted } : null,
      onboardingCompleted: isCompleted,
      isLoading: false,
    })
  },

  setOnboardingCompleted: (completed: boolean) =>
    set((state) => {
      const targetUserId = state.user?.id || state.profile?.id
      if (targetUserId) {
        try {
          if (completed) {
            localStorage.setItem(`latexai_onboarded_${targetUserId}`, 'true')
          } else {
            localStorage.removeItem(`latexai_onboarded_${targetUserId}`)
          }
        } catch {}
      }

      return {
        onboardingCompleted: completed,
        profile: state.profile
          ? { ...state.profile, onboardingCompleted: completed }
          : null,
      }
    }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  clearAuth: () =>
    set({
      session: null,
      user: null,
      profile: null,
      onboardingCompleted: false,
      isLoading: false,
    }),
}))
