import { useCallback, useMemo } from 'react'
import { useDeploy } from '@/context/deploy-context'
import { useEffectsLayer } from '@/context/effects-context'
import { rnd } from '@/lib/random'

/**
 * The two hidden sequences: a canary rollout, and a chaos-monkey run that
 * recovers on its own.
 */
export function useEasterEggs() {
  const { burst, showToast } = useEffectsLayer()
  const { run: deploy } = useDeploy()

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
