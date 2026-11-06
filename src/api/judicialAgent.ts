import { getAuthToken } from './auth'

export interface JudicialAgentRequest {
  userQuery: string
  /** Same id across every turn in a conversation — carries context server-side. */
  chatId: string
  file?: File
  signal?: AbortSignal
}

interface JudicialAgentResponsePayload {
  data: {
    role: string
    content: { text: string }[]
  }
}

/**
 * Calls the real judicial-agent backend. Single-shot request/response per
 * the documented API — the backend doesn't token-stream, so the UI shows a
 * typing indicator while this is in flight rather than faking a stream of
 * an answer we already have in full.
 */
export async function callJudicialAgent({
  userQuery,
  chatId,
  file,
  signal,
}: JudicialAgentRequest): Promise<string> {
  const baseUrl = import.meta.env.VITE_JUDICIAL_API_URL
  if (!baseUrl) {
    throw new Error('VITE_JUDICIAL_API_URL is not set — add it to .env.local.')
  }

  const form = new FormData()
  form.append('user_query', userQuery)
  form.append('chat_id', chatId)
  if (file) form.append('file', file)

  // Outside the fetch try/catch below on purpose — a token-fetch failure
  // (not logged in, Lambda unreachable) has its own clear message and
  // shouldn't get overwritten by the generic "could not reach the
  // assistant" fallback that's specifically about the agent call itself.
  const token = await getAuthToken()

  let response: Response
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      // No Content-Type header here on purpose — the browser sets
      // multipart/form-data with the correct boundary itself. Setting it
      // manually strips the boundary and the server can't parse the body.
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err

    // Covers network failure and — critically — the browser silently
    // blocking a plain-http request from an https page (mixed content).
    // Both look identical to fetch: a rejected promise with no HTTP status.
    throw new Error(
      'Could not reach the assistant. If this is running over HTTPS, the backend is still ' +
        'plain HTTP and the browser is blocking the request as mixed content.',
    )
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Not authorized — the auth token is missing, expired, or invalid.')
  }
  if (!response.ok) {
    throw new Error(`Assistant request failed (${response.status}).`)
  }

  const payload: JudicialAgentResponsePayload = await response.json()
  const text = payload.data?.content?.map((block) => block.text).join('\n\n')
  if (!text) {
    throw new Error('Assistant response was empty or in an unexpected shape.')
  }
  return text
}
