import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { env } from './lib/env'
import { errorTracker } from './lib/errorTracking'

// Initialize production error tracking (FE-7.04)
errorTracker.init()

async function prepareApp() {
  if (env.VITE_USE_MOCKS && import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
      })
    } catch (err) {
      console.error('[MSW] Failed to start mock service worker:', err)
    }
  }
}

prepareApp().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
