import { Fragment } from 'react'
import { HWSurface, HWChip, HWSkeleton, cn } from '@cycomdatasystems/headwindui'
import type { ChatMessage } from '../types'
import { TypingIndicator } from './TypingIndicator'
import { CopyButton } from './CopyButton'

function renderInline(text: string) {
  // Minimal inline-code parser (`code`) — enough for a prototype without
  // pulling in a markdown dependency. Plain-text segments use a Fragment
  // rather than a <span> so a long message doesn't wrap every word of
  // ordinary prose in throwaway DOM nodes.
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            'max-w-[75%] rounded-hw-lg px-4 py-2.5',
            'bg-hw-primary text-hw-text-contrast',
          )}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  const isEmpty = message.streaming && message.content.length === 0

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] w-full">
        <HWSurface className="bg-hw-surface border border-hw-border2">
          {isEmpty ? (
            <TypingIndicator />
          ) : message.streaming ? (
            <div aria-busy="true">
              <div className="tiptap">
                <p>{renderInline(message.content)}</p>
              </div>
              <HWSkeleton variant="text" lines={1} className="mt-2 max-w-[40%]" />
            </div>
          ) : (
            <div className="tiptap">
              <p>{renderInline(message.content)}</p>
            </div>
          )}

          {!message.streaming && message.citations && message.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.citations.map((c) => (
                <HWChip key={c.id} size="sm" variant="secondary">
                  {c.label}
                </HWChip>
              ))}
            </div>
          )}

          {!message.streaming && message.content.length > 0 && (
            <div className="mt-2 flex justify-end">
              <CopyButton value={message.content} />
            </div>
          )}
        </HWSurface>
      </div>
    </div>
  )
}
