import { AnimatePresence, animate, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { EffectsContext } from '@/context/effects-context'
import { fitCanvas } from '@/lib/canvas'
import { subscribeToTicker } from '@/lib/ticker'
import { createBurstField } from '@/scenes/burst'

interface Toast {
  id: number
  content: ReactNode
}

const ACCENT_VARS = ['--pf-a1', '--pf-a2', '--pf-a3', '--pf-up'] as const

/** Burst colours come from the live custom properties, so they follow the theme. */
function readAccents() {
  const styles = getComputedStyle(document.documentElement)
  return ACCENT_VARS.map((name) => styles.getPropertyValue(name).trim()).filter(Boolean)
}

export function EffectsProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef(createBurstField())
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const field = fieldRef.current

    return subscribeToTicker(() => {
      if (!field.size) return
      const surface = fitCanvas(canvas)
      if (surface) field.draw(surface.ctx, surface.h)
    })
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const burst = useCallback((x: number, y: number, count = 30, spread = 7) => {
    fieldRef.current.spawn(x, y, count, spread, readAccents())
  }, [])

  const showToast = useCallback((content: ReactNode, ms = 2600) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), content })
    toastTimer.current = window.setTimeout(() => setToast(null), ms)
  }, [])

  const shake = useCallback(() => {
    const shell = shellRef.current
    if (!shell || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animate(
      shell,
      { x: [0, -4, 5, -3, 3, 0], y: [0, 2, -2, -3, 3, 0] },
      { duration: 0.5, ease: 'easeInOut' },
    )
  }, [])

  const value = useMemo(() => ({ burst, showToast, shake }), [burst, shake, showToast])

  return (
    <EffectsContext value={value}>
      <div ref={shellRef}>{children}</div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[92] size-full"
      />
      <output
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[93] -translate-x-1/2"
      >
        <AnimatePresence mode="wait">
          {toast && (
            <motion.span
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5 rounded-full border border-line bg-bg-2/90 px-4.5 py-3 font-mono text-xs whitespace-nowrap text-ink shadow-[0_18px_50px_-18px_rgb(0_0_0/0.9)] backdrop-blur-xl"
            >
              {toast.content}
            </motion.span>
          )}
        </AnimatePresence>
      </output>
    </EffectsContext>
  )
}

