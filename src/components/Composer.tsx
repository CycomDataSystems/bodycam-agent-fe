import { useState, useRef } from 'react'
import { HWTextarea, HWButton } from '@cycomdatasystems/headwindui'

const MAX_LENGTH = 2000

export function Composer({
  disabled,
  onSend,
  onStop,
}: {
  disabled: boolean
  onSend: (text: string) => void
  onStop: () => void
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  // Enter-to-send, Shift+Enter for a newline — the exact SOW acceptance
  // criterion this whole thread started from.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-hw-border2 bg-hw-bg p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <HWTextarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            rows={1}
            placeholder="Ask about a case, statute, or document…"
            disabled={disabled}
          />
        </div>
        <HWButton
          variant="primary"
          isLoading={disabled}
          shortcut="⏎"
          onClick={disabled ? onStop : submit}
        >
          {disabled ? 'Stop' : 'Send'}
        </HWButton>
      </div>
      <div className="mt-1 flex justify-end">
        <span className="text-xs text-hw-text-muted">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  )
}
