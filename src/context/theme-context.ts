import { createContext, use } from 'react'
import type { Palette, ThemeName } from '@/lib/theme'

export interface ThemeValue {
  theme: ThemeName
  palette: Palette
  /** Swaps the theme behind a disc wiping out from `origin`. */
  toggleTheme: (origin?: { x: number; y: number }) => void
}

export const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme() {
  const value = use(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
