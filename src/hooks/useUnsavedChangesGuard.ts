import { useContext, useEffect, useCallback } from 'react'
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom'

export interface UseUnsavedChangesGuardOptions {
  isDirty: boolean
  message?: string
}

function useDataRouterBlocker(isDirty: boolean) {
  const inDataRouter = Boolean(useContext(UNSAFE_DataRouterContext))

  if (!inDataRouter) {
    return { state: 'unblocked' as const, proceed: () => {}, reset: () => {} }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  )
}

export function useUnsavedChangesGuard({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave this page?',
}: UseUnsavedChangesGuardOptions) {
  const blocker = useDataRouterBlocker(isDirty)

  // Browser reload / tab close listener
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault()
        event.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, message])

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed()
    }
  }, [blocker])

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  return {
    showPrompt: blocker.state === 'blocked',
    confirmNavigation,
    cancelNavigation,
    isBlocked: blocker.state === 'blocked',
  }
}
