export type ThemeName = 'dark' | 'light'

/**
 * Canvas colours. A 2D context cannot resolve custom properties, so the scenes
 * read from here while the DOM reads the same palette from `:root[data-theme]`.
 * Keep the two in step.
 */
export interface Palette {
  /** Foreground as space-separated channels, for `inkAlpha`. */
  ink: string
  a1: string
  a2: string
  a3: string
  up: string
  down: string
  bg: string
}

export const PALETTES: Record<ThemeName, Palette> = {
  dark: {
    ink: '233 236 245',
    a1: '#7c9cff',
    a2: '#4be3c1',
    a3: '#ffb86b',
    up: '#35d99a',
    down: '#ff6a6a',
    bg: '#07080c',
  },
  light: {
    ink: '19 21 28',
    a1: '#3f57d8',
    a2: '#0e8e75',
    a3: '#a9640e',
    up: '#0f8f5f',
    down: '#c8372f',
    bg: '#f7f6f3',
  },
}

export const inkAlpha = (palette: Palette, alpha: number) => `rgb(${palette.ink} / ${alpha})`

export const THEME_STORAGE_KEY = 'pf-theme'

export function readStoredTheme(): ThemeName | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    // Private browsing and blocked storage both throw; fall back to the default.
    return null
  }
}

export function storeTheme(theme: ThemeName) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Persistence is a convenience, never a requirement.
  }
}
