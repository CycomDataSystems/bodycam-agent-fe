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
}

export interface ChatError {
  message: string
  /** The original message text, resubmitted verbatim on retry. */
  retryText: string
}
