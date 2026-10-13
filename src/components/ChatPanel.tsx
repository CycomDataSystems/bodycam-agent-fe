import { useEffect, useRef, type ReactNode } from 'react'
import { HWEmptyState } from '@cycomdatasystems/headwindui'
import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'
import { Composer } from './Composer'

export function ChatPanel({
  messages,
  isStreaming,
  onSend,
  onStop,
  errorBanner,
}: {
  messages: ChatMessage[]
  isStreaming: boolean
  onSend: (text: string) => void
  onStop: () => void
  errorBanner?: ReactNode
}) {
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages — per-panel scroll only, per the brief:
  // "the app shell is overflow-hidden at full viewport height... a chat
  // transcript must do the same: min-h-0 on the flex child plus
  // overflow-y-auto on the message list, not a page-level scroll."
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    // h-screen + overflow-hidden root, matching the documented host-app
    // shell convention rather than letting the page itself scroll.
    <div className="h-screen w-full flex flex-col overflow-hidden bg-hw-bg text-hw-text">
      <header className="flex items-center justify-between border-b border-hw-border2 px-4 py-3">
        <h1 className="text-base font-bold text-hw-text0">Case Assistant</h1>
      </header>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <HWEmptyState
            title="Ask anything about this case"
            description="Query case documents, statutes, or the reference library — responses cite their sources."
            size="md"
          />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {errorBanner}
        <Composer disabled={isStreaming} onSend={onSend} onStop={onStop} />
      </div>
    </div>
  )
}
