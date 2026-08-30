import { createContext, use } from 'react'
import type { ReactNode } from 'react'

export interface EffectsValue {
  /** Confetti at viewport coordinates. */
  burst: (x: number, y: number, count?: number, spread?: number) => void
  showToast: (content: ReactNode, ms?: number) => void
  /** Knocks the whole page sideways for half a second. */
  shake: () => void
}

export const EffectsContext = createContext<EffectsValue | null>(null)

export function useEffectsLayer() {
  const value = use(EffectsContext)
  if (!value) throw new Error('useEffectsLayer must be used inside <EffectsProvider>')
  return value
}
