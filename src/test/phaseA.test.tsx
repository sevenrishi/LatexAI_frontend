import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi, DEMO_USER, DEMO_SESSION } from '@/features/auth/api/authApi'
import { ProtectedRoute } from '@/features/auth/guards/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/guards/PublicOnlyRoute'
import { OnboardingGuard } from '@/features/auth/guards/OnboardingGuard'

describe('Phase A — Auth & Onboarding Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().clearAuth()
  })

  describe('authApi and Demo Auth', () => {
    it('sets demo user and session in localStorage and store', () => {
      const { session, user, profile } = authApi.loginDemoUser()
      expect(session.access_token).toBe(DEMO_SESSION.access_token)
      expect(user.email).toBe(DEMO_USER.email)
      expect(profile.onboardingCompleted).toBe(true)
      expect(localStorage.getItem('latexai_demo_token')).toBe(DEMO_SESSION.access_token)
    })

    it('retrieves user profile via getMe', async () => {
      authApi.loginDemoUser()
      const profile = await authApi.getMe()
      expect(profile).toBeDefined()
      expect(profile.email).toBe('demo@latexai.dev')
      expect(profile.onboardingCompleted).toBe(true)
    })

    it('completes onboarding via completeOnboarding', async () => {
      authApi.loginDemoUser()
      const res = await authApi.completeOnboarding({
        targetRole: 'Staff Infrastructure Engineer',
        templateId: 'tpl_default_swe',
      })
      expect(res.onboardingCompleted).toBe(true)
    })
  })

  describe('ProtectedRoute Guard', () => {
    it('renders authenticating loader when auth state is loading', () => {
      useAuthStore.setState({ isLoading: true, session: null, user: null })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText(/Authenticating.../i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument()
    })

    it('redirects to /login if user is unauthenticated', () => {
      useAuthStore.setState({ isLoading: false, session: null, user: null })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page Screen</div>} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Login Page Screen')).toBeInTheDocument()
      expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument()
    })

    it('redirects to /verify-email if user email is unconfirmed', () => {
      const unconfirmedUser = {
        ...DEMO_USER,
        email_confirmed_at: '',
        confirmed_at: '',
        app_metadata: { provider: 'email' },
        user_metadata: { email_verified: false },
      }

      useAuthStore.setState({
        isLoading: false,
        session: DEMO_SESSION,
        user: unconfirmedUser,
      })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
            </Route>
            <Route path="/verify-email" element={<div>Verify Email Screen</div>} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Verify Email Screen')).toBeInTheDocument()
    })

    it('renders protected content when authenticated and verified', () => {
      authApi.loginDemoUser()
      useAuthStore.setState({
        isLoading: false,
        session: DEMO_SESSION,
        user: DEMO_USER,
      })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument()
    })
  })

  describe('OnboardingGuard', () => {
    it('redirects to /onboarding if user has not completed onboarding', () => {
      authApi.loginDemoUser()
      useAuthStore.setState({
        isLoading: false,
        session: DEMO_SESSION,
        user: DEMO_USER,
        onboardingCompleted: false,
      })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<OnboardingGuard requireCompleted={true} />}>
              <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            </Route>
            <Route path="/onboarding" element={<div>Onboarding Wizard Screen</div>} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Onboarding Wizard Screen')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
    })

    it('allows access to /dashboard if onboarding is completed', () => {
      authApi.loginDemoUser()
      useAuthStore.setState({
        isLoading: false,
        session: DEMO_SESSION,
        user: DEMO_USER,
        onboardingCompleted: true,
      })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<OnboardingGuard requireCompleted={true} />}>
              <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            </Route>
            <Route path="/onboarding" element={<div>Onboarding Wizard Screen</div>} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })
  })

  describe('PublicOnlyRoute', () => {
    it('redirects authenticated user to /dashboard', () => {
      authApi.loginDemoUser()
      useAuthStore.setState({
        isLoading: false,
        session: DEMO_SESSION,
        user: DEMO_USER,
        onboardingCompleted: true,
      })

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>Login Screen</div>} />
            </Route>
            <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Dashboard Screen')).toBeInTheDocument()
      expect(screen.queryByText('Login Screen')).not.toBeInTheDocument()
    })

    it('renders login screen when unauthenticated', () => {
      useAuthStore.setState({
        isLoading: false,
        session: null,
        user: null,
      })

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>Login Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Login Screen')).toBeInTheDocument()
    })
  })
})
