import { useEffect, useRef, useState } from 'react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { HWToaster, hwToast, HWButton } from '@cycomdatasystems/headwindui'
import { ChatPanel } from './components/ChatPanel'
import { ErrorBanner } from './components/ErrorBanner'
import { LoginGate } from './components/LoginGate'
import { callJudicialAgent } from './api/judicialAgent'
import { clearCachedToken } from './api/tokenLambda'
import { getStoredUserId, setStoredUserId, clearStoredUserId } from './auth/session'
import { readThemeMode, setThemeMode, syncThemeFromStorage } from './theme/themeMode'
import type { ThemeMode } from './theme/themeMode'
import type { ChatMessage, ChatError } from './types'

const THEME_ICONS: Record<ThemeMode, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: ComputerDesktopIcon,
}

function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => readThemeMode())

  const cycle = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    setThemeMode(next)
    setMode(next)
  }

  const Icon = THEME_ICONS[mode]

  return (
    <HWButton
      variant="ghost"
      size="sm"
      onClick={cycle}
      aria-label={`Theme: ${mode}. Click to change.`}
      leftIcon={<Icon className="h-4 w-4" />}
    />
  )
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(() => getStoredUserId())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // One id for the whole conversation, not per-message — the backend uses
  // this to carry multi-turn context, per Sara's example (same chat_id on a
  // follow-up query answers it without the case number being repeated).
  const chatIdRef = useRef(crypto.randomUUID())

  const patchMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  useEffect(() => {
    // Same purpose as CityLaw NG's themeMode module: re-apply whatever mode
    // is stored (in case the pre-hydration script and this module ever
    // disagree — they shouldn't, but this is the documented safety net).
    syncThemeFromStorage()
  }, [])

  const runRequest = async (text: string, file?: File) => {
    setError(null)
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachmentName: file?.name,
    }
    const assistantId = crypto.randomUUID()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Single-shot request/response — the backend doesn't token-stream, so
      // the typing indicator (via the empty-content assistant message above)
      // covers the wait rather than faking a stream of an answer already in
      // hand.
      const responseText = await callJudicialAgent({
        userQuery: text,
        chatId: chatIdRef.current,
        file,
        signal: controller.signal,
      })
      patchMessage(assistantId, { streaming: false, content: responseText, timestamp: Date.now() })
      hwToast.success('Response ready')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        patchMessage(assistantId, { streaming: false })
        return
      }
      // Drop the partial (empty) assistant message — the banner, not a
      // half-written bubble, is the record of what happened.
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      setError({
        message: err instanceof Error ? err.message : 'The assistant request failed.',
        retryText: text,
        retryFile: file,
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const handleRetry = () => {
    if (!error) return
    void runRequest(error.retryText, error.retryFile)
  }

  const handleLogin = (id: string) => {
    setStoredUserId(id)
    setUserId(id)
  }

  const handleSwitchUser = () => {
    clearStoredUserId()
    clearCachedToken()
    setUserId(null)
    // A fresh identity shouldn't inherit the previous person's transcript.
    setMessages([])
    setError(null)
  }

  if (!userId) {
    return (
      <>
        <LoginGate onSubmit={handleLogin} />
        <HWToaster position="bottom-right" />
      </>
    )
  }

  return (
    <>
      <ChatPanel
        messages={messages}
        isStreaming={isStreaming}
        onSend={runRequest}
        onStop={handleStop}
        headerActions={
          <>
            {/* Hidden below sm: on a narrow screen the login id is the
                least essential item here, and "Switch user" already makes
                clear whose session this is without it. */}
            <span className="hidden max-w-[8rem] truncate text-xs text-hw-text-muted sm:inline">
              {userId}
            </span>
            <HWButton variant="ghost" size="sm" onClick={handleSwitchUser}>
              Switch user
            </HWButton>
            <ThemeToggle />
          </>
        }
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
