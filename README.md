# LatexAI Web Application

The official web client for **LatexAI** — a modern, responsive web application that enables users to manage resume profiles, customize LaTeX templates, write and preview LaTeX documents in real-time, and run AI-powered ATS optimizations.

---

## ✨ Features

- **Interactive LaTeX Editor**: In-browser LaTeX editing powered by CodeMirror (`@uiw/react-codemirror`) with syntax highlighting and instant compilation triggers.
- **Side-by-Side PDF Preview**: Real-time PDF rendering (`react-pdf`) with zoom, pan, and direct PDF downloads.
- **AI-Powered Resume Tailoring**: Job description keyword extraction, dynamic ATS scoring, and one-click STAR-format bullet point rewrites.
- **Drag-and-Drop Organization**: Section and bullet-point reordering using `@dnd-kit`.
- **Template Gallery**: Browse, preview, and apply pre-tested, industry-standard LaTeX resume templates.
- **Profile & Resume Ingestion**: Multi-format resume upload (.pdf, .docx) with automatic data extraction and review.
- **Mock Service Worker (MSW)**: Full offline and mock preview capabilities for rapid UI development and testing.

---

## 🛠 Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler & Tooling**: Vite, Tailwind CSS v4, Oxlint, ESLint
- **State Management & Data Fetching**: Zustand, TanStack React Query v5
- **UI Components & Icons**: Radix UI primitives, Lucide React, Sonner (toasts)
- **Editor & PDF Engine**: `@uiw/react-codemirror`, `react-pdf`
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Testing**: Vitest, React Testing Library, Playwright (E2E)

---

## 📁 Directory Structure

```
frontend/
├── public/                 # Static assets and MSW service worker
├── e2e/                    # Playwright end-to-end tests
├── src/
│   ├── app/                # Application root providers & layout wrappers
│   ├── assets/             # Brand logos, icons, and static graphics
│   ├── components/         # Reusable UI primitives (dialogs, buttons, inputs)
│   ├── features/           # Domain feature modules (editor, templates, profile, ats)
│   ├── hooks/              # Custom React hooks (debounce, keyboard shortcuts, media queries)
│   ├── lib/                # API client (Axios/fetch), Supabase client, query client
│   ├── mocks/              # Mock Service Worker (MSW) handlers for local development
│   ├── pages/              # Route views (Dashboard, Editor, Templates, ATS, Auth, etc.)
│   ├── store/              # Zustand global client stores (auth, editor, ui)
│   ├── test/               # Vitest test setup and mock factories
│   ├── types/              # TypeScript models, API types & schemas
│   ├── App.tsx             # Route definitions and navigation layout
│   └── main.tsx            # Application entrypoint
├── index.html
├── vite.config.ts          # Vite configuration
└── playwright.config.ts    # Playwright E2E configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `frontend/` directory based on `.env.example`:

```bash
cp .env.example .env
```

| Key | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for the LatexAI backend API | `http://localhost:4000/api/v1` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous Supabase key | `your-anon-key` |
| `VITE_APP_URL` | Frontend application host URL | `http://localhost:5173` |
| `VITE_ENABLE_DEMO_LOGIN` | Enable mock/demo user quick login button | `true` |
| `VITE_USE_MOCKS` | Enable Mock Service Worker (MSW) mocking | `false` |

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The app will launch at `http://localhost:5173`.

---

## 🧪 Testing & Verification

```bash
# Run unit & component tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run Playwright End-to-End tests
npm run test:e2e

# Type check
npm run typecheck

# Linting & Formatting
npm run lint
npm run lint:fix
npm run format
```

---

## 📦 Building for Production

```bash
# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```
