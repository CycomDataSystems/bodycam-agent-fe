import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { HWBanner, HWButton } from '@cycomdatasystems/headwindui'

/**
 * Request-level error banner — distinct from a per-message failure. Sits
 * above the composer so it's visible regardless of scroll position in the
 * transcript, and offers a retry affordance rather than a dead end.
 */
export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string
  onRetry: () => void
  onDismiss: () => void
}) {
  return (
    <div className="px-4 pt-3">
      <HWBanner
        variant="danger"
        icon={<ExclamationTriangleIcon className="h-5 w-5" />}
        dismissible
        onDismiss={onDismiss}
        dismissLabel="Dismiss error"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{message}</span>
          <HWButton variant="danger" size="sm" onClick={onRetry}>
            Retry
          </HWButton>
        </div>
      </HWBanner>
    </div>
  )
}
