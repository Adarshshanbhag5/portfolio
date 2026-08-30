import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useCallback } from 'react'
import type { MouseEvent } from 'react'

const SPRING = { stiffness: 280, damping: 26, mass: 0.35 }

/**
 * Nudges a target toward the pointer as it crosses a container. Spread
 * `handlers` on the container and `style` on the element that should drift.
 */
export function useMagnetic(range = { x: 14, y: 9 }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, SPRING)
  const springY = useSpring(y, SPRING)
  const reducedMotion = useReducedMotion()

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reducedMotion) return
      const rect = event.currentTarget.getBoundingClientRect()
      x.set(((event.clientX - rect.left) / rect.width - 0.5) * range.x * 2)
      y.set(((event.clientY - rect.top) / rect.height - 0.5) * range.y * 2)
    },
    [range.x, range.y, reducedMotion, x, y],
  )

  const onMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return {
    handlers: { onMouseMove, onMouseLeave },
    style: { x: springX, y: springY },
  }
}
