import type { Session, User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  headline?: string
  avatarUrl?: string
  targetRole?: string
  industry?: string
  experienceLevel?: string
  tonePreference?: string
  bulletDensity?: string
  onboardingCompleted: boolean
  activeTemplateId?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  onboardingCompleted: boolean
  isLoading: boolean
  setSession: (session: Session | null, user?: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setOnboardingCompleted: (completed: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  clearAuth: () => void
}
