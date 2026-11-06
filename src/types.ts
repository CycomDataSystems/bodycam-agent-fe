export interface Citation {
  id: string
  label: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  streaming?: boolean
  /** Epoch ms. Set when sent (user) or when the response completes (assistant) — not on creation of the placeholder bubble. */
  timestamp?: number
  /** Name of a file attached to this (user) message, for display only — the actual File object isn't retained after sending. */
  attachmentName?: string
}

export interface ChatError {
  message: string
  /** The original message text, resubmitted verbatim on retry. */
  retryText: string
  /** The original attachment, if any, resubmitted alongside retryText on retry. */
  retryFile?: File
}
