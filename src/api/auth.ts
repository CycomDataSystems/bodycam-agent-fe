import { getStoredUserId } from '../auth/session'
import { fetchToken } from './tokenLambda'

/**
 * Token provider, isolated behind one function on purpose. Primary path:
 * use the LegalEdge login ID collected by the LoginGate to get a token
 * from Sara's Lambda. VITE_DEV_JWT, if set, bypasses this entirely — kept
 * for edge-case debugging, not the normal path anymore now that the
 * Lambda is live.
 */
export async function getAuthToken(): Promise<string> {
  const devToken = import.meta.env.VITE_DEV_JWT
  if (devToken) return devToken

  const userId = getStoredUserId()
  if (!userId) {
    throw new Error('Not logged in — no LegalEdge login ID on file for this session.')
  }
  return fetchToken(userId)
}
