import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { WizardLayout } from '@/components/layout/WizardLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/guards/ProtectedRoute'
import { OnboardingGuard } from '@/features/auth/guards/OnboardingGuard'
import { PublicOnlyRoute } from '@/features/auth/guards/PublicOnlyRoute'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ScrollRestoration } from '@/components/common/ScrollRestoration'
import { Loader2 } from 'lucide-react'

// Page Loader Suspense Fallback
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs text-muted-foreground">Loading...</span>
    </div>
  </div>
)

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <ScrollRestoration />
    <Component />
  </Suspense>
)

// Lazy loaded page components
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'))
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'))
const NewTemplatePage = lazy(() => import('@/pages/NewTemplatePage'))
const TemplateEditorPage = lazy(() => import('@/pages/TemplateEditorPage'))
const GeneratePage = lazy(() => import('@/pages/GeneratePage'))
const GenerationProgressPage = lazy(() => import('@/pages/GenerationProgressPage'))
const ReviewPage = lazy(() => import('@/pages/ReviewPage'))
const PdfPreviewPage = lazy(() => import('@/pages/PdfPreviewPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export const router = createBrowserRouter([
  // Public Marketing Routes
  {
    element: (
      <ErrorBoundary>
        <MarketingLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: '/',
        element: withSuspense(LandingPage),
      },
    ],
  },

  // Public Only Auth Routes (Login, Register, etc.)
  {
    element: (
      <ErrorBoundary>
        <PublicOnlyRoute />
      </ErrorBoundary>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: withSuspense(LoginPage) },
          { path: '/register', element: withSuspense(RegisterPage) },
          { path: '/verify-email', element: withSuspense(VerifyEmailPage) },
          { path: '/forgot-password', element: withSuspense(ForgotPasswordPage) },
          { path: '/reset-password', element: withSuspense(ResetPasswordPage) },
        ],
      },
    ],
  },

  // Auth callback
  {
    path: '/auth/callback',
    element: withSuspense(AuthCallbackPage),
  },

  // Onboarding Wizard Route (Protected, but before full onboarding is completed)
  {
    element: (
      <ErrorBoundary>
        <ProtectedRoute />
      </ErrorBoundary>
    ),
    children: [
      {
        element: <OnboardingGuard requireCompleted={false} />,
        children: [
          {
            element: <WizardLayout />,
            children: [
              {
                path: '/onboarding',
                element: withSuspense(OnboardingPage),
              },
            ],
          },
        ],
      },
    ],
  },

  // Authenticated App Routes (Protected + Onboarding completed)
  {
    element: (
      <ErrorBoundary>
        <ProtectedRoute />
      </ErrorBoundary>
    ),
    children: [
      {
        element: <OnboardingGuard requireCompleted={true} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: withSuspense(DashboardPage) },
              { path: '/profile', element: withSuspense(ProfilePage) },
              { path: '/templates', element: withSuspense(TemplatesPage) },
              { path: '/templates/new', element: withSuspense(NewTemplatePage) },
              { path: '/templates/:id', element: withSuspense(TemplateEditorPage) },
              { path: '/generate', element: withSuspense(GeneratePage) },
              { path: '/generate/:id', element: withSuspense(GenerationProgressPage) },
              { path: '/generate/:id/progress', element: withSuspense(GenerationProgressPage) },
              { path: '/review/:id', element: withSuspense(ReviewPage) },
              { path: '/history', element: withSuspense(HistoryPage) },
              { path: '/settings', element: withSuspense(SettingsPage) },
            ],
          },
          // Standalone Fullscreen Preview Routes (without AppLayout sidebar)
          { path: '/preview/:id', element: withSuspense(PdfPreviewPage) },
          { path: '/review/:id/pdf', element: withSuspense(PdfPreviewPage) },
          { path: '/review/:id/preview', element: withSuspense(PdfPreviewPage) },
        ],
      },
    ],
  },

  // 404 Not Found & Wildcard Catch-all
  {
    path: '/404',
    element: withSuspense(NotFoundPage),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
])
