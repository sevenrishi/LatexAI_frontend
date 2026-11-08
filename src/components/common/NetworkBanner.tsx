import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'

export function NetworkBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 dark:bg-amber-700"
    >
      <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
      <span>You are currently offline. Changes may not be saved until your connection is restored.</span>
    </div>
  )
}
