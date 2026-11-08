import { env } from './env'

export type AnalyticsEventType =
  | 'page_view'
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'logout_completed'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'resume_downloaded'
  | 'resume_edited'
  | 'template_activated'
  | 'template_created'
  | 'error_occurred'

export interface AnalyticsEvent {
  event: AnalyticsEventType
  properties?: Record<string, unknown>
  timestamp?: string
}

class AnalyticsManager {
  private isEnabled: boolean
  private queue: AnalyticsEvent[] = []

  constructor() {
    this.isEnabled =
      typeof window !== 'undefined' &&
      (Boolean((window as any).__ENABLE_ANALYTICS__) ||
        env.VITE_APP_URL?.includes('latexai.dev') ||
        false)
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  public track(event: AnalyticsEventType, properties: Record<string, unknown> = {}) {
    const payload: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
      timestamp: new Date().toISOString(),
    }

    this.queue.push(payload)

    // Dispatch custom DOM event for testing / dev inspection
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('latexai:analytics', { detail: payload })
      )
    }

    if (this.isEnabled) {
      this.sendToProvider(payload)
    }
  }

  public trackPageView(path: string, title?: string) {
    this.track('page_view', { path, title: title || (typeof document !== 'undefined' ? document.title : '') })
  }

  public getRecentEvents(): AnalyticsEvent[] {
    return [...this.queue]
  }

  public clearQueue() {
    this.queue = []
  }

  private sendToProvider(payload: AnalyticsEvent) {
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const endpoint = `${env.VITE_API_URL.replace(/\/$/, '')}/analytics/events`
        navigator.sendBeacon(endpoint, JSON.stringify(payload))
      }
    } catch {
      // ignore transmission failures
    }
  }
}

export const analytics = new AnalyticsManager()
