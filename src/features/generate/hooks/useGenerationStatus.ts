import { useState, useEffect, useRef, useCallback } from 'react'
import { generateApi } from '../api/generateApi'
import type { GenerationStatus, GenerationStatusResponse, GenerationStatusError } from '@/types/generation'

export interface UseGenerationStatusOptions {
  /** Initial polling interval in milliseconds. Defaults to 1500ms */
  initialInterval?: number
  /** Multiplier for exponential backoff. Defaults to 1.25 */
  backoffFactor?: number
  /** Maximum polling interval in milliseconds. Defaults to 8000ms */
  maxInterval?: number
  /** Whether polling is actively enabled. Defaults to true when id is provided */
  enabled?: boolean
  /** Callback fired when generation reaches COMPLETED status */
  onComplete?: (status: GenerationStatusResponse) => void
  /** Callback fired when generation reaches FAILED status */
  onError?: (error: GenerationStatusError | Error) => void
}

export interface UseGenerationStatusReturn {
  data: GenerationStatusResponse | null
  status: GenerationStatus
  stage: string
  progress: number
  elapsedSeconds: number
  isPolling: boolean
  isCompleted: boolean
  isFailed: boolean
  isTabVisible: boolean
  error: GenerationStatusError | null
  refetch: () => Promise<void>
  retry: () => Promise<void>
  cancel: () => Promise<void>
}

export function useGenerationStatus(
  id?: string,
  options: UseGenerationStatusOptions = {}
): UseGenerationStatusReturn {
  const {
    initialInterval = 1500,
    backoffFactor = 1.25,
    maxInterval = 8000,
    enabled = true,
    onComplete,
    onError,
  } = options

  const [data, setData] = useState<GenerationStatusResponse | null>(null)
  const [status, setStatus] = useState<GenerationStatus>('QUEUED')
  const [stage, setStage] = useState<string>('Initializing generation pipeline...')
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<GenerationStatusError | null>(null)
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== 'undefined' ? document.visibilityState !== 'hidden' : true
  )

  // Mutable refs to prevent stale closures and manage timers cleanly
  const currentIntervalRef = useRef<number>(initialInterval)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isTabVisibleRef = useRef<boolean>(isTabVisible)
  const isPollingActiveRef = useRef<boolean>(false)
  const isTerminalRef = useRef<boolean>(false)

  // Keep callback refs
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const isCompleted = status === 'COMPLETED'
  const isFailed = status === 'FAILED'

  // Clear pending timers helper
  const clearTimers = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const isMountedRef = useRef<boolean>(true)

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearTimers()
    }
  }, [clearTimers])

  // Core polling step
  const executePoll = useCallback(async () => {
    if (!id || !enabled || isTerminalRef.current || !isMountedRef.current) return

    try {
      if (isMountedRef.current) setIsPolling(true)
      const res = await generateApi.getStatus(id)
      if (!isMountedRef.current) return

      setData(res)

      if (res.status) {
        setStatus(res.status)
      }
      if (res.stage) {
        setStage(res.stage)
      }
      if (typeof res.progress === 'number') {
        setProgress(res.progress)
      }

      if (res.status === 'COMPLETED') {
        isTerminalRef.current = true
        if (isMountedRef.current) {
          setIsPolling(false)
          setProgress(100)
        }
        clearTimers()
        onCompleteRef.current?.(res)
        return
      }

      if (res.status === 'FAILED') {
        isTerminalRef.current = true
        if (isMountedRef.current) setIsPolling(false)
        clearTimers()
        const errObj = res.error || {
          code: 'GENERATION_FAILED',
          message: 'Resume generation or compilation failed.',
        }
        if (isMountedRef.current) setError(errObj)
        onErrorRef.current?.(errObj)
        return
      }

      // Schedule next poll with exponential backoff if tab is still visible
      if (isTabVisibleRef.current && enabled && !isTerminalRef.current && isMountedRef.current) {
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * backoffFactor,
          maxInterval
        )

        clearTimers()
        pollTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) executePoll()
        }, currentIntervalRef.current)
      }
    } catch (err: unknown) {
      // If temporary network glitch, schedule next poll with backoff
      if (isTabVisibleRef.current && enabled && !isTerminalRef.current && isMountedRef.current) {
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * backoffFactor,
          maxInterval
        )
        clearTimers()
        pollTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) executePoll()
        }, currentIntervalRef.current)
      }
    } finally {
      if (isMountedRef.current) {
        setIsPolling(false)
      }
    }
  }, [id, enabled, backoffFactor, maxInterval, clearTimers])

  // Tab visibility pause handling (FE-4.05)
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState !== 'hidden'
      isTabVisibleRef.current = isVisible
      setIsTabVisible(isVisible)

      if (isVisible) {
        // Tab became visible: reset backoff and immediately poll if still active
        if (!isTerminalRef.current && id && enabled) {
          currentIntervalRef.current = initialInterval
          clearTimers()
          executePoll()
        }
      } else {
        // Tab is hidden: pause polling to save resources
        clearTimers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id, enabled, initialInterval, clearTimers, executePoll])

  // Start polling when enabled and ID is available
  useEffect(() => {
    if (!id || !enabled) {
      clearTimers()
      return
    }

    isTerminalRef.current = false
    currentIntervalRef.current = initialInterval
    isPollingActiveRef.current = true

    // Initial immediate poll
    executePoll()

    return () => {
      clearTimers()
    }
  }, [id, enabled, initialInterval, clearTimers, executePoll])

  // Stopwatch elapsed seconds timer
  useEffect(() => {
    if (!id || !enabled || isTerminalRef.current) return

    elapsedTimerRef.current = setInterval(() => {
      if (!isTerminalRef.current) {
        setElapsedSeconds((prev) => prev + 1)
      }
    }, 1000)

    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }
    }
  }, [id, enabled, status])

  // Stop elapsed timer when terminal
  useEffect(() => {
    if (isCompleted || isFailed) {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }
    }
  }, [isCompleted, isFailed])

  // Manual refetch
  const refetch = useCallback(async () => {
    if (!id) return
    isTerminalRef.current = false
    currentIntervalRef.current = initialInterval
    clearTimers()
    await executePoll()
  }, [id, initialInterval, clearTimers, executePoll])

  // Retry generation action
  const retry = useCallback(async () => {
    if (!id) return
    setError(null)
    setStatus('QUEUED')
    setStage('Retrying resume generation...')
    setProgress(5)
    setElapsedSeconds(0)
    isTerminalRef.current = false
    currentIntervalRef.current = initialInterval
    clearTimers()

    try {
      await generateApi.retryGeneration(id)
    } catch {
      // ignore if mock doesn't fail
    }

    await executePoll()
  }, [id, initialInterval, clearTimers, executePoll])

  // Cancel generation action
  const cancel = useCallback(async () => {
    if (!id) return
    try {
      await generateApi.cancelGeneration(id)
    } catch {
      // ignore
    }
    isTerminalRef.current = true
    clearTimers()
    setStatus('FAILED')
    setError({
      code: 'CANCELLED',
      message: 'Resume generation was cancelled by the user.',
    })
  }, [id, clearTimers])

  return {
    data,
    status,
    stage,
    progress,
    elapsedSeconds,
    isPolling,
    isCompleted,
    isFailed,
    isTabVisible,
    error,
    refetch,
    retry,
    cancel,
  }
}
