import { AnimatePresence, animate, m, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DeployContext } from '@/context/deploy-context'
import { useEffectsLayer } from '@/context/effects-context'
import { cn } from '@/lib/cn'

const STAGES = ['build', 'test', 'push image', 'canary', 'promote'] as const
const FLEET = 6
const EASE = [0.16, 1, 0.3, 1] as const

interface Step {
  at: number
  stage?: number
  /** Instances now running the new version. */
  fleet?: number
  /** Share of production traffic on the new version. */
  traffic?: number
  log?: string
}

/**
 * A rollout, in the order one actually happens: build and test, push the image,
 * send a slice of traffic at a single canary instance, then widen the pour
 * while the old instances drain.
 */
const TIMELINE: readonly Step[] = [
  { at: 0, stage: 0, log: 'building image' },
  { at: 300, stage: 1, log: 'tests green · 214 passed' },
  { at: 620, stage: 2, log: 'pushed sha256:9f3c1a2e · 34 MB' },
  { at: 980, stage: 3, fleet: 1, traffic: 5, log: 'canary up · shifting 5% of traffic' },
  { at: 1360, log: 'canary healthy · p99 84ms · 0 5xx' },
  { at: 1560, fleet: 3, traffic: 45 },
  { at: 1860, fleet: 5, traffic: 80, log: 'old instances draining · connections 0' },
  { at: 2120, stage: 4, fleet: FLEET, traffic: 100 },
]

const SETTLE_AT = 2360
const CLOSE_AT = 3000

export function DeployProvider({ children }: { children: ReactNode }) {
  const { burst, shake } = useEffectsLayer()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState(0)
  const [fleet, setFleet] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [settled, setSettled] = useState(false)
  const [release, setRelease] = useState(41)
  const timers = useRef<number[]>([])
  /**
   * A ref, not state: the state flag was captured in this callback's closure,
   * so a click landing before React re-rendered could start a second timeline
   * on top of the first. It also keeps `run` stable, which stops every context
   * consumer re-rendering eight times per rollout.
   */
  const running = useRef(false)

  const traffic = useMotionValue(0)
  const trafficWidth = useTransform(traffic, (v) => `${v}%`)
  const trafficLabel = useTransform(traffic, (v) => `${Math.round(v)}%`)

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const at = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const run = useCallback(() => {
    if (running.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Still acknowledge the action, just without the theatre.
      setRelease((v) => v + 1)
      return
    }

    running.current = true
    clearTimers()
    setRelease((v) => v + 1)
    setOpen(true)
    setStage(0)
    setFleet(0)
    setLogs([])
    setSettled(false)
    traffic.set(0)

    for (const step of TIMELINE) {
      at(step.at, () => {
        if (step.stage !== undefined) setStage(step.stage)
        if (step.fleet !== undefined) setFleet(step.fleet)
        if (step.traffic !== undefined) {
          animate(traffic, step.traffic, { duration: 0.32, ease: 'easeOut' })
        }
        if (step.log) setLogs((rows) => [...rows, step.log as string].slice(-4))
      })
    }

    at(SETTLE_AT, () => {
      setSettled(true)
      setLogs((rows) => [...rows, `promoted · ${FLEET}/${FLEET} healthy · 0 downtime`].slice(-4))
      shake()
      const { innerWidth: w, innerHeight: h } = window
      burst(w / 2, h * 0.62, 70, 8)
      at(140, () => burst(w * 0.3, h * 0.55, 30, 7))
      at(260, () => burst(w * 0.7, h * 0.55, 30, 7))
    })

    at(CLOSE_AT, () => {
      setOpen(false)
      running.current = false
    })
  }, [at, burst, clearTimers, shake, traffic])

  const value = useMemo(() => ({ run }), [run])

  return (
    <DeployContext value={value}>
      {children}
      <AnimatePresence>
        {open && (
          <m.aside
            key="rollout"
            aria-hidden
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="pointer-events-none fixed inset-x-0 bottom-5 z-[94] flex justify-center px-4"
          >
            <div className="w-[min(560px,100%)] rounded-2xl border border-line bg-bg-2/95 p-4 font-mono text-[11px] text-ink shadow-[0_24px_60px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl">
              <header className="flex items-center gap-2.5">
                <m.span
                  animate={{ scale: settled ? 1 : [1, 1.35, 1] }}
                  transition={{ duration: 0.9, repeat: settled ? 0 : Infinity }}
                  className={cn('size-2 rounded-full', settled ? 'bg-up' : 'bg-a3')}
                  style={{ boxShadow: '0 0 10px currentColor' }}
                />
                <span className="tracking-[0.12em] text-muted">
                  deploy · v{release} &rarr; prod
                </span>
                <span className="ml-auto text-faint">traffic</span>
                <m.span className="text-a2">{trafficLabel}</m.span>
              </header>

              <ol className="mt-3.5 flex items-center gap-1.5">
                {STAGES.map((name, i) => (
                  <li key={name} className="flex flex-1 items-center gap-1.5">
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-[9.5px] tracking-[0.1em] transition-colors duration-200',
                          i < stage ? 'text-a2' : i === stage ? 'text-ink' : 'text-faint',
                        )}
                      >
                        {name}
                      </span>
                      <span className="mt-1 block h-0.5 overflow-hidden rounded-full bg-line">
                        <m.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: i <= stage ? 1 : 0 }}
                          transition={{ duration: 0.26, ease: 'easeOut' }}
                          className={cn(
                            'block h-full origin-left rounded-full',
                            i < stage ? 'bg-a2' : 'bg-a1',
                          )}
                        />
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-3.5 flex items-center gap-3">
                <span className="text-faint">fleet</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: FLEET }, (_, i) => {
                    const upgraded = i < fleet
                    return (
                      <m.span
                        key={i}
                        animate={{
                          scale: upgraded ? [0.7, 1.15, 1] : 1,
                          opacity: upgraded ? 1 : 0.55,
                        }}
                        transition={{ duration: 0.34, ease: EASE }}
                        className={cn(
                          'size-4 rounded-[3px]',
                          upgraded ? 'bg-a2' : 'bg-a1/45',
                        )}
                      />
                    )
                  })}
                </div>
                <div className="ml-auto h-1.5 w-28 overflow-hidden rounded-full bg-line">
                  <m.div
                    style={{ width: trafficWidth }}
                    className="h-full rounded-full bg-linear-to-r/srgb from-a1 to-a2"
                  />
                </div>
              </div>

              <ul className="mt-3.5 flex min-h-16 flex-col justify-end gap-1 text-[10.5px] text-muted">
                <AnimatePresence initial={false}>
                  {logs.map((line) => (
                    <m.li
                      key={line}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className={line.startsWith('promoted') ? 'text-a2' : undefined}
                    >
                      {line.startsWith('promoted') ? '✓' : '↳'} {line}
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </m.aside>
        )}
      </AnimatePresence>
    </DeployContext>
  )
}
