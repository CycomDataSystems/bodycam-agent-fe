// Standalone stand-in for CityLaw NG's `@clng/utilities/theme/themeMode`.
// We don't have access to that module (it's an internal path alias inside
// their monorepo, not part of the public headwindui package) — this mirrors
// its documented contract so swapping to the real module later is a
// find-and-replace of the import, not a rewrite of every call site.

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // private window / blocked site data — silently no-op, same as the
    // documented contract for the real module
  }
}

/** Absent key reads as 'system', matching the documented historical contract. */
export function readThemeMode(): ThemeMode {
  const stored = safeGetItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'system'
}

export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeMode(mode: ThemeMode): void {
  const resolved = resolveThemeMode(mode)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function setThemeMode(mode: ThemeMode): void {
  safeSetItem(STORAGE_KEY, mode)
  applyThemeMode(mode)
}

export function syncThemeFromStorage(): ThemeMode {
  const mode = readThemeMode()
  applyThemeMode(mode)
  return mode
}
