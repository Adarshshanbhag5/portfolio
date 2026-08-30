import { animate } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from '@/context/theme-context'
import { useEffectsLayer } from '@/context/effects-context'
import { PALETTES, readStoredTheme, storeTheme } from '@/lib/theme'
import type { ThemeName } from '@/lib/theme'

const WIPE = { duration: 0.58, ease: [0.62, 0, 0.24, 1] } as const

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline script in index.html has already applied this to <html>, so
  // reading it here just keeps React in step — there is no second paint.
  const [theme, setTheme] = useState<ThemeName>(() => readStoredTheme() ?? 'dark')
  const { burst } = useEffectsLayer()
  const wipeRef = useRef<HTMLDivElement>(null)
  const wiping = useRef(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      if (wiping.current) return
      const next: ThemeName = theme === 'dark' ? 'light' : 'dark'
      storeTheme(next)

      const wipe = wipeRef.current
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!wipe || !origin || reduced) {
        setTheme(next)
        return
      }

      const { x, y } = origin
      // Reach the furthest corner, with a little margin for the glow ring.
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 1.04
      const target = PALETTES[next]

      Object.assign(wipe.style, {
        display: 'block',
        opacity: '1',
        left: `${x - radius}px`,
        top: `${y - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        background: target.bg,
        boxShadow: `0 0 0 2px ${target.a2}, 0 0 42px 4px ${target.a2}`,
      })

      void (async () => {
        wiping.current = true
        burst(x, y, 22, 6)

        // Scaling a fixed-size disc keeps this off the layout path entirely.
        await animate(wipe, { scale: [0, 1] }, WIPE)
        setTheme(next)
        burst(x, y, 26, 7)

        await animate(wipe, { opacity: 0, boxShadow: 'none' }, { duration: 0.34 })
        wipe.style.display = 'none'
        wiping.current = false
      })()
    },
    [burst, theme],
  )

  const value = useMemo(
    () => ({ theme, palette: PALETTES[theme], toggleTheme }),
    [theme, toggleTheme],
  )

  return (
    <ThemeContext value={value}>
      {children}
      <div ref={wipeRef} aria-hidden className="pointer-events-none fixed z-[89] hidden rounded-full" />
    </ThemeContext>
  )
}
