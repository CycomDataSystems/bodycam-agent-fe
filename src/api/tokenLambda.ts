/**
 * Calls Sara's token-issuing Lambda. Per her notes:
 *  - Content-Type: application/json is required — without it, API Gateway
 *    base64-encodes the body in a way that breaks parsing.
 *  - Tokens expire after 1 hour and must be refreshed, not cached forever.
 *
 * SECURITY NOTE: this endpoint currently has no authentication in front of
 * it, and it trusts whatever "role" is sent in the request body with no
 * server-side verification — a client can ask for role: "admin" and get
 * it. This app NEVER sends anything but "user" as a result. That's a
 * mitigation on our side, not a fix — the endpoint itself still needs an
 * authorizer and server-side role lookup before this is safe for anyone
 * else who finds the URL. Tracked separately with Sara/Michael; not
 * something the frontend can close on its own.
 */

const REFRESH_AFTER_MS = 55 * 60 * 1000 // real expiry is 60 min; refresh a bit early

let cachedToken: string | null = null
let cachedAt = 0

export async function fetchToken(userId: string): Promise<string> {
  const now = Date.now()
  if (cachedToken && now - cachedAt < REFRESH_AFTER_MS) {
    return cachedToken
  }

  const url = import.meta.env.VITE_TOKEN_LAMBDA_URL
  if (!url) {
    throw new Error('VITE_TOKEN_LAMBDA_URL is not set — add it to .env.local.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, role: 'user' }),
  })

  if (!response.ok) {
    throw new Error(`Could not get an auth token (${response.status}).`)
  }

  const payload: { token: string } = await response.json()
  if (!payload.token) {
    throw new Error('Token endpoint responded without a token.')
  }

  cachedToken = payload.token
  cachedAt = now
  return cachedToken
}

/** Forces the next fetchToken() call to hit the Lambda again — used on logout. */
export function clearCachedToken(): void {
  cachedToken = null
  cachedAt = 0
}
