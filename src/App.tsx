import { useEffect, useRef, useState } from 'react'
import { HWToaster, hwToast, HWButton } from '@cycomdatasystems/headwindui'
import { ChatPanel } from './components/ChatPanel'
import { ErrorBanner } from './components/ErrorBanner'
import { readThemeMode, setThemeMode, syncThemeFromStorage } from './theme/themeMode'
import type { ThemeMode } from './theme/themeMode'
import type { ChatMessage, ChatError } from './types'

const MOCK_RESPONSE = {
  text: `Based on the case documents, the hearing for case 13-10009 was continued to next month per the filed motion. The court cited scheduling conflicts on both sides as the reason for the continuance. No new evidence was introduced during this session.`,
  citations: [
    { id: 'c1', label: 'Case 13-10009, Docket #14' },
    { id: 'c2', label: 'Motion to Continue, p. 2' },
  ],
}

function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => readThemeMode())

  const cycle = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    setThemeMode(next)
    setMode(next)
  }

  return (
    <HWButton variant="ghost" size="sm" onClick={cycle}>
      Theme: {mode}
    </HWButton>
  )
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const stopRef = useRef(false)

  const patchMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  useEffect(() => {
    // Same purpose as CityLaw NG's themeMode module: re-apply whatever mode
    // is stored (in case the pre-hydration script and this module ever
    // disagree — they shouldn't, but this is the documented safety net).
    syncThemeFromStorage()
  }, [])

  const runRequest = (text: string) => {
    setError(null)
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantId = crypto.randomUUID()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)
    stopRef.current = false

    // Demo-only failure path: typing "error" simulates a request that fails
    // mid-flight, so the banner has a real trigger to show against rather
    // than sitting unused in the component tree.
    const shouldFail = /\berror\b/i.test(text)
    const words = MOCK_RESPONSE.text.split(' ')
    let i = 0

    const tick = () => {
      if (stopRef.current) {
        patchMessage(assistantId, { streaming: false })
        setIsStreaming(false)
        return
      }
      if (shouldFail && i >= Math.floor(words.length / 3)) {
        // Drop the partial assistant message — the banner, not a half-written
        // bubble, is the record of what happened.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
        setIsStreaming(false)
        setError({
          message: 'The assistant could not complete this response. Your message was not lost.',
          retryText: text,
        })
        return
      }
      if (i >= words.length) {
        patchMessage(assistantId, { streaming: false, citations: MOCK_RESPONSE.citations })
        setIsStreaming(false)
        hwToast.success('Response ready')
        return
      }
      i += 1
      patchMessage(assistantId, { content: words.slice(0, i).join(' ') })
      setTimeout(tick, 45)
    }

    setTimeout(tick, 350) // brief pause before first token — lets the typing indicator show
  }

  const handleStop = () => {
    stopRef.current = true
  }

  const handleRetry = () => {
    if (!error) return
    runRequest(error.retryText)
  }

  return (
    <>
      <div className="absolute right-4 top-3 z-50">
        <ThemeToggle />
      </div>
      <ChatPanel
        messages={messages}
        isStreaming={isStreaming}
        onSend={runRequest}
        onStop={handleStop}
        errorBanner={
          error && (
            <ErrorBanner
              message={error.message}
              onRetry={handleRetry}
              onDismiss={() => setError(null)}
            />
          )
        }
      />
      <HWToaster position="bottom-right" />
    </>
  )
}
