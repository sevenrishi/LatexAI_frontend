import { env } from './env'

export interface Breadcrumb {
  timestamp: string
  category: string
  message: string
  data?: Record<string, unknown>
  level?: 'info' | 'warning' | 'error'
}

export interface CapturedError {
  id: string
  message: string
  stack?: string
  context?: Record<string, unknown>
  breadcrumbs: Breadcrumb[]
  user?: { id?: string; email?: string }
  timestamp: string
  url: string
}

class ErrorTracker {
  private breadcrumbs: Breadcrumb[] = []
  private capturedErrors: CapturedError[] = []
  private currentUser?: { id?: string; email?: string }
  private isInitialized = false

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return
    this.isInitialized = true

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      this.captureException(reason, { type: 'unhandledrejection' })
    })

    this.addBreadcrumb('lifecycle', 'Error tracking initialized', { env: env.VITE_APP_URL })
  }

  public setUser(user?: { id?: string; email?: string }) {
    this.currentUser = user
  }

  public addBreadcrumb(
    category: string,
    message: string,
    data?: Record<string, unknown>,
    level: 'info' | 'warning' | 'error' = 'info'
  ) {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      level,
    }

    this.breadcrumbs.push(breadcrumb)
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift()
    }
  }

  public captureException(error: Error | unknown, context?: Record<string, unknown>): string {
    const err = error instanceof Error ? error : new Error(String(error))
    const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

    const payload: CapturedError = {
      id: errorId,
      message: err.message || 'Unknown error',
      stack: err.stack,
      context,
      breadcrumbs: [...this.breadcrumbs],
      user: this.currentUser,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    this.capturedErrors.push(payload)

    // Dispatch custom DOM event for inspection/testing
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('latexai:error', { detail: payload })
      )
    }

    // In production with remote error reporting configured
    this.sendToRemoteService(payload)

    return errorId
  }

  public captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'error',
    context?: Record<string, unknown>
  ): string {
    return this.captureException(new Error(`[${level.toUpperCase()}] ${message}`), context)
  }

  public getCapturedErrors(): CapturedError[] {
    return [...this.capturedErrors]
  }

  public clear() {
    this.breadcrumbs = []
    this.capturedErrors = []
  }

  private sendToRemoteService(payload: CapturedError) {
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const endpoint = `${env.VITE_API_URL.replace(/\/$/, '')}/telemetry/errors`
        navigator.sendBeacon(endpoint, JSON.stringify(payload))
      }
    } catch {
      // ignore
    }
  }
}

export const errorTracker = new ErrorTracker()
