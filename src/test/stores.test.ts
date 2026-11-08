import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

describe('Zustand Stores', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  it('updates auth state correctly', () => {
    expect(useAuthStore.getState().session).toBeNull()
    expect(useAuthStore.getState().onboardingCompleted).toBe(false)

    useAuthStore.getState().setOnboardingCompleted(true)
    expect(useAuthStore.getState().onboardingCompleted).toBe(true)
  })

  it('toggles UI sidebar and theme', () => {
    const initialCollapsed = useUIStore.getState().sidebarCollapsed
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(!initialCollapsed)

    useUIStore.getState().setTheme('dark')
    expect(useUIStore.getState().theme).toBe('dark')
  })
})
