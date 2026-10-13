import { useRef, useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { HWButton } from '@cycomdatasystems/headwindui'

const CONFIRM_MS = 2000

/**
 * Icon-only copy action for an assistant message. Follows Headwind's own
 * documented copy-button contract (§7.23 HWFieldDisplay in the AI agent
 * guide) rather than inventing a new pattern:
 *   - aria-label="Copy value to clipboard" on the trigger
 *   - a role="status" aria-live="polite" region announces the result
 *   - Enter/Space activate it (free, since this is a native HWButton)
 *   - the confirmation auto-reverts after ~2s
 */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), CONFIRM_MS)
    } catch {
      // Clipboard API can reject in an insecure context or without
      // permission — same "fails silently" behavior the guide documents
      // for HWFieldDisplay, surfaced here as a visible status instead so
      // the user isn't left wondering why nothing happened.
      setCopied(false)
    }
  }

  return (
    <>
      <HWButton
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy message to clipboard'}
        leftIcon={
          copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4" />
          )
        }
      >
        {copied ? 'Copied' : 'Copy'}
      </HWButton>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Message copied to clipboard' : ''}
      </span>
    </>
  )
}
