import { useCallback, useMemo } from 'react'
import { useEffectsLayer } from '@/context/effects-context'
import { rnd } from '@/lib/random'

/**
 * The two hidden sequences: a clean rolling deploy, and a chaos-monkey run
 * that recovers on its own. Both are pure composition over the effects layer.
 */
export function useEasterEggs() {
  const { burst, showToast, shake } = useEffectsLayer()

  const deploy = useCallback(() => {
    const { innerWidth: w, innerHeight: h } = window
    burst(w / 2, h * 0.45, 90, 9)
    shake()
    showToast(
      <>
        <span className="text-a2">●</span> rolling deploy · 3/3 pods healthy · 0 downtime
      </>,
      3200,
    )
    setTimeout(() => burst(w * 0.25, h * 0.4, 40, 7), 260)
    setTimeout(() => burst(w * 0.75, h * 0.4, 40, 7), 420)
  }, [burst, shake, showToast])

  const chaos = useCallback(() => {
    const { innerWidth: w, innerHeight: h } = window
    showToast(
      <>
        <span className="text-a3">⚠</span> chaos monkey released · circuit breaker open · retrying…
      </>,
      3000,
    )
    for (let i = 0; i < 6; i++) {
      setTimeout(() => burst(rnd(60, w - 60), rnd(h * 0.2, h * 0.7), 26, 8), i * 180)
    }
    setTimeout(
      () =>
        showToast(
          <>
            <span className="text-a2">✓</span> recovered · all workflows resumed from last checkpoint
          </>,
          2600,
        ),
      3100,
    )
  }, [burst, showToast])

  return useMemo(() => ({ deploy, chaos }), [chaos, deploy])
}
