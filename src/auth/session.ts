// Stopgap identity collection — NOT real authentication. No password, no
// server-side verification of the claim. This exists only to stop every
// tester/user sharing one hardcoded identity (the "sub": "1" problem
// documented in the LegalEdge Query Security Overview) while the real
// identity-passthrough design (LegalEdge → Case Assistant, pending the
// embedding decision) is still unresolved.
//
// sessionStorage, not localStorage: clears when the tab closes rather than
// persisting indefinitely, since this isn't a real logged-in session.

const STORAGE_KEY = 'caseAssistantUserId'

export function getStoredUserId(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredUserId(userId: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, userId)
  } catch {
    // private browsing / blocked storage — same fail-open-to-nothing
    // behavior as themeMode.ts; the login gate will just ask again.
  }
}

export function clearStoredUserId(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
