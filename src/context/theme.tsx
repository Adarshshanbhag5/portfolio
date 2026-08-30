import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from '@/context/theme-context'
import { useEffectsLayer } from '@/context/effects-context'
import { PALETTES, readStoredTheme, storeTheme } from '@/lib/theme'
import type { ThemeName } from '@/lib/theme'

/**
 * The switch is staged like a rolling cutover: the screen is split into bands
 * and each flips a beat after the one above it, so the new theme sweeps down
 * the page rather than arriving all at once.
 */
const BANDS = 12
const SWEEP = { duration: 0.19, ease: [0.4, 0, 0.2, 1] } as const
const STEP = 0.015

type Phase = 'idle' | 'cover' | 'reveal'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => readStoredTheme() ?? 'dark')
  const [phase, setPhase] = useState<Phase>('idle')
  /** The theme being swept in, held until the cover completes. */
  const [incoming, setIncoming] = useState<ThemeName | null>(null)
  const { burst } = useEffectsLayer()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      if (phase !== 'idle') return
      const next: ThemeName = theme === 'dark' ? 'light' : 'dark'
      storeTheme(next)

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTheme(next)
        return
      }

      setIncoming(next)
      setPhase('cover')
      if (origin) burst(origin.x, origin.y, 14, 5)
    },
    [burst, phase, theme],
  )

  /**
   * Fires once, from the last band to move. On cover the page is fully hidden,
   * so that is the moment to swap; on reveal the transition is over.
   */
  const handleSweepEnd = useCallback(() => {
    if (phase === 'cover') {
      if (incoming) setTheme(incoming)
      setPhase('reveal')
      return
    }
    setPhase('idle')
    setIncoming(null)
  }, [incoming, phase])

  const value = useMemo(
    () => ({ theme, palette: PALETTES[theme], toggleTheme }),
    [theme, toggleTheme],
  )

  const target = incoming ? PALETTES[incoming] : null

  return (
    <ThemeContext value={value}>
      {children}
      {target && phase !== 'idle' && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[89]">
          {Array.from({ length: BANDS }, (_, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase === 'cover' ? 1 : 0 }}
              transition={{ ...SWEEP, delay: i * STEP }}
              onAnimationComplete={i === BANDS - 1 ? handleSweepEnd : undefined}
              style={{
                top: `${(i * 100) / BANDS}%`,
                // A hair of overlap keeps sub-pixel seams from showing through.
                height: `${100 / BANDS + 0.2}%`,
                background: target.bg,
              }}
              className={`absolute inset-x-0 will-change-transform ${
                phase === 'cover' ? 'origin-left' : 'origin-right'
              }`}
            >
              <span
                className="absolute inset-y-0 right-0 w-0.5"
                style={{ background: target.a2, boxShadow: `0 0 14px ${target.a2}` }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </ThemeContext>
  )
}
