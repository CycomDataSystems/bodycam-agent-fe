import { useState } from 'react'
import { HWInput, HWButton, HWSurface } from '@cycomdatasystems/headwindui'

/**
 * Stopgap identity collection, not real authentication — see
 * src/auth/session.ts for why this exists and what it does and doesn't
 * verify. Deliberately plain: one field, one action.
 */
export function LoginGate({ onSubmit }: { onSubmit: (userId: string) => void }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-hw-bg p-4">
      <HWSurface className="w-full max-w-sm bg-hw-surface border border-hw-border2">
        <h1 className="text-lg font-bold text-hw-text0">Case Assistant</h1>
        <p className="mt-1 text-sm text-hw-text-muted">
          Enter your LegalEdge login ID to continue.
        </p>

        <div className="mt-4">
          <HWInput
            label="LegalEdge login ID"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. jsmith"
            autoFocus
          />
        </div>

        <HWButton variant="primary" className="mt-4 w-full" onClick={submit} disabled={!value.trim()}>
          Continue
        </HWButton>

        <p className="mt-3 text-xs text-hw-text-muted">
          This identifies you for case-access checks. It is not a password — real
          sign-in is coming once this connects to LegalEdge directly.
        </p>
      </HWSurface>
    </div>
  )
}
