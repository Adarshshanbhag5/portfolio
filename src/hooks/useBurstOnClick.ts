import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { useEffectsLayer } from '@/context/effects-context'

/** Confetti from the pointer. Spread the result onto any clickable element. */
export function useBurstOnClick(count = 34, spread = 7) {
  const { burst } = useEffectsLayer()
  return useCallback(
    (event: MouseEvent) => burst(event.clientX, event.clientY, count, spread),
    [burst, count, spread],
  )
}
