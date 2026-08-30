import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'

const RING_SPRING = { stiffness: 420, damping: 34, mass: 0.5 }
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

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      const target = event.target as Element | null
      setHot(Boolean(target?.closest?.(INTERACTIVE)))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{
          width: hot ? 48 : 30,
          height: hot ? 48 : 30,
          backgroundColor: hot ? 'color-mix(in srgb, var(--pf-a2) 10%, transparent)' : 'transparent',
        }}
        transition={{ duration: 0.22 }}
        className="pointer-events-none fixed top-0 left-0 z-[91] -translate-x-1/2 -translate-y-1/2 rounded-full border border-a2"
      />
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[91] size-1.25 -translate-x-1/2 -translate-y-1/2 rounded-full bg-a2"
      />
    </>
  )
}
