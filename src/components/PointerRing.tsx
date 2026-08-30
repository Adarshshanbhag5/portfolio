import { m, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const RING_SPRING = { stiffness: 620, damping: 38, mass: 0.4 }
/** Elements the ring opens up over. */
const INTERACTIVE = 'a, button, [data-scramble]'

/** Trailing cursor ring with a hard dot at the true pointer position. */
export function PointerRing() {
  // Touch pointers have no cursor to decorate.
  const [enabled] = useState(() => !window.matchMedia('(pointer: coarse)').matches)
  const [hot, setHot] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, RING_SPRING)
  const ringY = useSpring(y, RING_SPRING)
  const pending = useRef<Element | null>(null)
  const frame = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      // Motion values are written directly; only the hit test is throttled,
      // since `closest` walks the tree and does not need to run per event.
      x.set(event.clientX)
      y.set(event.clientY)
      pending.current = event.target as Element | null

      frame.current ||= requestAnimationFrame(() => {
        frame.current = 0
        const over = Boolean(pending.current?.closest?.(INTERACTIVE))
        // Returning the previous value lets React bail out of the render.
        setHot((was) => (was === over ? was : over))
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame.current)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <m.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{
          width: hot ? 48 : 30,
          height: hot ? 48 : 30,
          backgroundColor: hot ? 'color-mix(in srgb, var(--pf-a2) 10%, transparent)' : 'transparent',
        }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none fixed top-0 left-0 z-[91] -translate-x-1/2 -translate-y-1/2 rounded-full border border-a2"
      />
      <m.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[91] size-1.25 -translate-x-1/2 -translate-y-1/2 rounded-full bg-a2"
      />
    </>
  )
}
