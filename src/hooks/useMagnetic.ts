import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'

const SPRING = { stiffness: 280, damping: 26, mass: 0.35 }

/**
 * Nudges a target toward the pointer as it crosses a container. Spread
 * `handlers` on the container and `style` on the element that should drift.
 *
 * The container's box is measured once per entry rather than per move: reading
 * a rect on every mousemove forces a layout sixty times a second.
 */
export function useMagnetic(range = { x: 14, y: 9 }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, SPRING)
  const springY = useSpring(y, SPRING)
  const reducedMotion = useReducedMotion()
  const bounds = useRef<DOMRect | null>(null)

  // The cached rect is viewport-relative, so anything that moves the container
  // invalidates it; the next pointer move re-measures.
  useEffect(() => {
    const invalidate = () => {
      bounds.current = null
    }
    window.addEventListener('resize', invalidate)
    window.addEventListener('scroll', invalidate, { passive: true })
    return () => {
      window.removeEventListener('resize', invalidate)
      window.removeEventListener('scroll', invalidate)
    }
  }, [])

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reducedMotion) return
      const rect = (bounds.current ??= event.currentTarget.getBoundingClientRect())
      x.set(((event.clientX - rect.left) / rect.width - 0.5) * range.x * 2)
      y.set(((event.clientY - rect.top) / rect.height - 0.5) * range.y * 2)
    },
    [range.x, range.y, reducedMotion, x, y],
  )

  const onMouseLeave = useCallback(() => {
    bounds.current = null
    x.set(0)
    y.set(0)
  }, [x, y])

  return {
    handlers: { onMouseMove, onMouseLeave },
    style: { x: springX, y: springY },
  }
}
