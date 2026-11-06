import { useState, useRef, useEffect } from 'react'
import { ArrowUpIcon, StopIcon } from '@heroicons/react/24/solid'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import { HWTextarea, HWButton, HWChip } from '@cycomdatasystems/headwindui'

// Soft internal cap — no visible counter per request, but requests shouldn't
// grow unbounded. Truncated silently in the onChange handler below.
const MAX_LENGTH = 2000

// Auto-grow ceiling: grows with real content up to ~6-7 lines, then an
// internal scrollbar takes over — matches text-sm's ~20px line height plus
// the textarea's own py-2 (16px) vertical padding.
const MAX_TEXTAREA_HEIGHT = 160

export function Composer({
  disabled,
  onSend,
  onStop,
}: {
  disabled: boolean
  onSend: (text: string, file?: File) => void
  onStop: () => void
}) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, file ?? undefined)
    setValue('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Enter-to-send, Shift+Enter for a newline — the exact SOW acceptance
  // criterion this whole thread started from.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }

  // Auto-grow: measure the actual content height and set it directly on the
  // DOM node. Resetting to 'auto' first is what makes it shrink back down
  // too (deleting text), not just grow — without the reset, scrollHeight
  // would just keep reporting the previously-set (larger) height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [value])

  return (
    <div className="border-t border-hw-border2 bg-hw-bg p-4">
      {file && (
        <div className="mb-2">
          <HWChip
            size="sm"
            variant="secondary"
            onClose={() => {
              setFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            closeLabel="Remove attachment"
          >
            {file.name}
          </HWChip>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          // Broad but not unrestricted — matches the kinds of case material
          // this agent already deals with (documents, images). Not a hard
          // backend contract, just a sane default for the OS file picker.
          accept=".pdf,.doc,.docx,.txt,image/*"
        />
        <HWButton
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach a file"
          className="h-10 w-10 shrink-0 rounded-full px-0"
        >
          <PaperClipIcon className="h-4 w-4" />
        </HWButton>

        <div className="flex-1">
          <HWTextarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            // No maxLength prop: HWTextarea only renders its built-in
            // counter when maxLength is set, and the counter wasn't
            // wanted. The cap above still applies, just silently.
            rows={1}
            // Short enough to reliably fit on one line even on narrow
            // phone widths — the previous longer placeholder needed two
            // lines there, and with rows={1} the second line just got cut
            // off rather than wrapping visibly.
            placeholder="Ask a question…"
            disabled={disabled}
            // Inline style, not a class: HWTextarea's className prop only
            // reaches its outer wrapper div, not the inner <textarea> (its
            // resize-y class is hardcoded there) — an inline style is the
            // only way to override it without forking the component.
            style={{ resize: 'none' }}
            // Softer, pill-leaning radius on the wrapper — this one DOES
            // land on the outer div, where rounded-hw-md normally applies.
            className="rounded-3xl"
          />
        </div>

        <HWButton
          variant="primary"
          onClick={disabled ? onStop : submit}
          // Deliberately NOT isLoading here: isLoading sets the button's
          // native `disabled` attribute (confirmed in HWButton's source),
          // which blocks ALL clicks including this one — the previous
          // isLoading={disabled} meant Stop could never actually fire.
          // Native disabled is reserved for the one case that should truly
          // block interaction: Send with nothing typed.
          disabled={!disabled && !value.trim()}
          aria-label={disabled ? 'Stop generating' : 'Send message'}
          className="h-10 w-10 shrink-0 rounded-full px-0"
        >
          {disabled ? (
            <StopIcon className="h-4 w-4" />
          ) : (
            <ArrowUpIcon className="h-4 w-4" />
          )}
        </HWButton>
      </div>
    </div>
  )
}
