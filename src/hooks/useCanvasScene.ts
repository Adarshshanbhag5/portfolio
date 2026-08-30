import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { useTheme } from '@/context/theme-context'
import { fitCanvas } from '@/lib/canvas'
import { subscribeToTicker } from '@/lib/ticker'
import type { Scene, SceneEmit } from '@/scenes/types'

/** Nodes a scene writes its live readouts into, keyed by the scene's own names. */
export type SceneReadouts = Record<string, RefObject<HTMLElement | null>>

/**
 * Mounts a canvas scene: sizes it to the device pixel ratio, rebuilds its state
 * on resize, pauses it off-screen, and drives it from the shared ticker.
 *
 * Readouts bypass React on purpose: these values change 60 times a second and
 * a re-render per frame would cost far more than one textContent write.
 */
export function useCanvasScene<State>(scene: Scene<State>, readouts?: SceneReadouts) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme, palette } = useTheme()
  const reducedMotion = useReducedMotion()

  const latest = useRef({ theme, palette, readouts })
  useEffect(() => {
    latest.current = { theme, palette, readouts }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    let state: State | null = null
    let visible = scene.alwaysRun ?? false

    const rebuild = () => {
      const { clientWidth, clientHeight } = canvas
      state = clientWidth && clientHeight ? scene.create(clientWidth, clientHeight) : null
    }
    rebuild()

    const resizeObserver = new ResizeObserver(rebuild)
    resizeObserver.observe(canvas)

    const intersectionObserver = scene.alwaysRun
      ? null
      : new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
          rootMargin: '80px',
        })
    intersectionObserver?.observe(canvas)

    const emit: SceneEmit = (key, text, color) => {
      const node = latest.current.readouts?.[key]?.current
      if (!node) return
      if (node.textContent !== text) node.textContent = text
      if (color && node.style.color !== color) node.style.color = color
    }

    const unsubscribe = subscribeToTicker((dt) => {
      if (!visible || !state) return
      const surface = fitCanvas(canvas)
      if (!surface) return
      const { theme: currentTheme, palette: currentPalette } = latest.current
      scene.draw(state, {
        ...surface,
        dt,
        theme: currentTheme,
        palette: currentPalette,
        emit,
      })
    })

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
      intersectionObserver?.disconnect()
    }
  }, [scene, reducedMotion])

  return canvasRef
}
