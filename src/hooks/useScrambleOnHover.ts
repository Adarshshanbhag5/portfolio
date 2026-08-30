import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

const GLYPHS = '01<>/[]{}=+*-~$#%'
const DURATION = 1250
const REPAINT_MS = 62
/** Letters resolve left to right, slowly at first. */
const RESOLVE_CURVE = 2.3

/**
 * Decodes the element's text out of random glyphs on hover. The box is pinned
 * for the duration so substituted characters can never reflow the line.
 */
export function useScrambleOnHover<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion) return

    const original = el.textContent ?? ''
    let frame = 0
    let running = false

    const start = () => {
      if (running || !original) return
      running = true

      const { width } = el.getBoundingClientRect()
      const previous = el.style.cssText
      el.style.display = 'inline-block'
      el.style.width = `${width}px`
      el.style.whiteSpace = 'nowrap'

      const startedAt = performance.now()
      let paintedAt = 0

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / DURATION)

        if (now - paintedAt > REPAINT_MS || progress === 1) {
          paintedAt = now
          const settled = Math.floor(original.length * (1 - (1 - progress) ** RESOLVE_CURVE))
          let out = ''
          for (let i = 0; i < original.length; i++) {
            const char = original[i]
            out +=
              i < settled || char === ' ' || char === '.'
                ? char
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          }
          el.textContent = out
        }

        if (progress < 1) {
          frame = requestAnimationFrame(step)
          return
        }
        el.textContent = original
        el.style.cssText = previous
        running = false
      }

      frame = requestAnimationFrame(step)
    }

    el.addEventListener('mouseenter', start)
    return () => {
      el.removeEventListener('mouseenter', start)
      cancelAnimationFrame(frame)
      if (running) {
        el.textContent = original
        el.style.cssText = ''
      }
    }
  }, [reducedMotion])

  return ref
}
