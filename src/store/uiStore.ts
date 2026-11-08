import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

export interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  activeGenerationId: string | null
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setActiveGenerationId: (id: string | null) => void
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      activeGenerationId: null,

      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      setMobileMenuOpen: (open: boolean) =>
        set({ mobileMenuOpen: open }),

      setActiveGenerationId: (id: string | null) =>
        set({ activeGenerationId: id }),
    }),
    {
      name: 'latexai-ui-preferences',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)
