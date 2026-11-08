import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback500 } from './ErrorFallback500'

import { errorTracker } from '@/lib/errorTracking'
import { analytics } from '@/lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
    errorTracker.captureException(error, {
      componentStack: errorInfo.componentStack,
    })
    analytics.track('error_occurred', {
      type: 'react_component_error',
      message: error.message,
    })
  }

  public resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <ErrorFallback500
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}
