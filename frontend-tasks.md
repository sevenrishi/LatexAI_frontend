# Tasks — React Frontend App & Backend Integration

Scope: only the React client (built with **React Vite + Tailwind CSS**) and its integration with the backend API. 

After completing each task check the respective boxes like this - [ ]

---

## Phase 0 — Project Foundation

- [x] FE-0.01 - Scaffold project via `npm create vite@latest web -- --template react-ts` (Node 20)
- [x] FE-0.02 - Configure Tailwind CSS v4 via `@tailwindcss/vite` with class-based dark mode and design tokens
- [x] FE-0.03 - Set up path aliases (`@/`), ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier, and husky/lint-staged
- [x] FE-0.04 - Create folder structure: `src/{app,pages,features/{auth,profile,templates,generate,history,settings},components/{ui,layout,common},lib,hooks,store,types,mocks}`
- [x] FE-0.05 - Configure validated environment variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`, `VITE_ENABLE_DEMO_LOGIN`, `VITE_USE_MOCKS`)
- [x] FE-0.06 - Install shadcn/ui primitives and base icon/toast libraries (`lucide-react`, `sonner`)
- [x] FE-0.07 - Set up `react-router-dom` with lazy-loaded pages, route guards (`ProtectedRoute`, `OnboardingGuard`, `PublicOnlyRoute`), and scroll restoration
- [x] FE-0.08 - Create core layouts: `MarketingLayout`, `AuthLayout`, `WizardLayout`, `AppLayout` (responsive sidebar, top bar, and mobile drawer)
- [x] FE-0.09 - Configure `lib/supabase.ts` for auth-only session handling
- [x] FE-0.10 - Build `lib/api.ts` fetch wrapper with Bearer token injection, envelope unwrap, typed `ApiError`, 401 refresh interceptor, and `errorMessages.ts` mappings
- [x] FE-0.11 - Configure TanStack Query v5 with sensible stale times, query-key factories, and error toast hooks
- [x] FE-0.12 - Set up Zustand stores for auth session and UI preferences
- [x] FE-0.13 - Add global `ErrorBoundary`, 500 fallback, `NotFound` view, and online/offline banner
- [x] FE-0.14 - Build shared form UI kit: fields, counters, month-yearpickers, tag inputs, confirm dialogs, and `useUnsavedChangesGuard` block logic
- [x] FE-0.15 - Set up MSW handlers and fixtures mirroring the backend contract when `VITE_USE_MOCKS=true`
- [x] FE-0.16 - Configure Vitest, React Testing Library, MSW test harness, and Playwright E2E
- [x] FE-0.17 - Set up Vercel deployment with SPA rewrite rules (`vercel.json`) and preview branch builds

## Phase A — Authentication & Onboarding

- [x] FE-1.01 - Implement auth bootstrap: `getSession()` check on load and `onAuthStateChange` subscription without redirect flicker
- [x] FE-1.02 - Wire `GET /auth/me` to load user identity, onboarding completion status, and active template IDs
- [x] FE-1.03 - Implement route guards enforcing authentication and email verification requirements
- [x] FE-1.04 - Build W-01 Landing page (hero, features, FAQ, footer, responsive nav)
- [x] FE-1.05 - Build W-02 Login screen (email/password form, validation, OAuth triggers, dev-only demo login button)
- [x] FE-1.06 - Build W-03 Sign up screen (strength meter, terms acceptance, redirect to verify)
- [x] FE-1.07 - Build W-04 Verify email screen (cooldown timer, resend button, cross-tab auto-advance check)
- [x] FE-1.08 - Build W-05 Auth callback page (PKCE session exchange, error cards, recovery routing)
- [x] FE-1.09 - Build W-06 Forgot password and W-07 Reset password screens
- [x] FE-1.10 - Build W-11 Onboarding wizard (4 step views in `?step=`, completeness check, API-backed completion sync)
- [x] FE-1.11 - Build W-12 Dashboard shell with greeting, primary generation CTA, and navigation links

## Phase B — Profile (Knowledge Base) Setup

- [x] FE-2.01 - Set up TanStack Query hooks (`useProfile`) and optimistic mutations with automatic rollback
- [x] FE-2.02 - Build W-13 Profile shell view with completeness progress ring, missing-section chips, and import trigger
- [x] FE-2.03 - Build Contact info section form with validation and dynamic link repeaters
- [x] FE-2.04 - Build Professional Summary editor with character limits and counter
- [x] FE-2.05 - Build Experience list and drawer form (dates, current-role switch, drag-and-drop bullets editor via `@dnd-kit`)
- [x] FE-2.06 - Build Education list and edit form (institution, degree, dates, GPA, honors)
- [x] FE-2.07 - Build Skills manager grouped by category with chip input, bulk paste, and reordering
- [x] FE-2.08 - Build Certifications list and edit form
- [x] FE-2.09 - Build Projects list and edit form (tech tags, links, description)
- [x] FE-2.10 - Implement unsaved changes guards, delete confirmation dialogs, and server error field mapping across all profile views
- [x] FE-2.11 - Build W-14 Resume Import step 1 & 2: drag-and-drop file dropzone (PDF/DOCX <= 5MB), client validation, progress state, and scanned-PDF error handling
- [x] FE-2.12 - Build W-14 Import step 3: review screen with per-section include toggles, inline editing, keep/use-imported choice, merge vs. replace selection, and confirm actions

## Phase C — Template Setup

- [x] FE-3.01 - Install and build lazy-loaded `PdfViewer` component using `react-pdf` (pdf.js worker setup, zoom controls, pagination)
- [x] FE-3.02 - Build W-15 Templates list screen (card grid showing active, default, and custom styles, action menus)
- [x] FE-3.03 - Build W-16 New template view (duplicate default, file upload, or paste with client lint feedback)
- [x] FE-3.04 - Build W-17 CodeMirror LaTeX editor interface with toolbar and read-only handling for global defaults
- [x] FE-3.05 - Implement template Preview tab (`Compile preview` trigger, sample/profile toggle, clickable compiler error line jumps)
- [x] FE-3.06 - Implement Placeholders contract tab and Lint issue list tab with editor insertion helpers
- [x] FE-3.07 - Wire template actions: save, save-and-activate, duplicate, delete, and unsaved changes guard

## Phase D — Job Input

- [x] FE-4.01 - Build W-18 New Resume page shell with segmented control ("Paste text" vs "Job URL") and usage counters
- [x] FE-4.02 - Build Job URL fetch input with live extraction preview, loading spinner, and automated fallback to the text-paste tab upon bot-blocking errors (`URL_BLOCKED` / `URL_FETCH_FAILED`)
- [x] FE-4.03 - Wire job submission to `POST /generate`, handling specific error codes (`PROFILE_INCOMPLETE`, `QUOTA_EXCEEDED`, `RATE_LIMITED`) with actionable links
- [x] FE-4.04 - Support pre-filling inputs from query params (`?from=<generationId>`) for the resume reuse flow

## Phase E/F — JD Analysis & Tailoring (Client Integration)

- [x] FE-4.05 - Build `useGenerationStatus(id)` polling hook with exponential backoff and tab-visibility pause handling
- [x] FE-4.06 - Build W-19 Generation Progress screen displaying a vertical status stepper, elapsed timer, rotating tips, and error cards with retry controls

## Phase G/H — Rendering & Compilation (Client Integration)

- [x] FE-4.07 - Integrate progress screen state transitions seamlessly through LaTeX rendering and server-side compilation stages into final completion routing

## Phase I — ATS Score (Client Integration)

- [x] FE-5.01 - Build W-20 Review screen layout with status chips, score badges, and dual-panel views
- [x] FE-5.02 - Build embedded PDF preview panel with URL-expiry refetch handling and "out of date" edit overlays
- [x] FE-5.03 - Build W-20 ATS tab component: interactive score gauge, requirement coverage bars, matched/missing chips with profile-add shortcuts, format check warnings, and disclaimer note

## Phase J — Review, Download, History

- [x] FE-5.04 - Build W-20 Changes tab component displaying stats, AI change notes, per-role diff accordions, and traceability flag panels
- [x] FE-5.05 - Build W-20 Edit tab component: structured fields for summary, bullet points, skills, and projects with `Save and re-render` actions triggering patch-and-rerender pipelines
- [x] FE-5.06 - Implement secure PDF and `.tex` downloads via API-provided signed URLs with custom filename resolution
- [x] FE-5.07 - Build W-21 History page with debounced search, status/score filters, cursor pagination, row actions, delete confirmations, and error retries
- [x] FE-5.08 - Build W-22 Settings views (Account details, Appearance theme switching with persistence, Security change-password forms, Data export, and typed-`DELETE` account deletion dialog)

## Phase L — Testing & QA

- [x] FE-7.01 - Conduct mobile-to-desktop responsive QA layout passes across all screens
- [x] FE-7.02 - Execute accessibility (a11y) audits for keyboard navigability, focus trapping in dialogs, and contrast compliance
- [x] FE-7.03 - Optimize performance with route-level code splitting, asset preloading, and bundle budget enforcement
- [x] FE-7.04 - Configure production error tracking and analytics funnel metrics
- [x] FE-7.05 - Implement Playwright E2E integration test scripts covering complete happy paths and failure fallbacks
- [x] FE-7.06 - Deploy to production on Vercel with verified environment variables and backend CORS configuration