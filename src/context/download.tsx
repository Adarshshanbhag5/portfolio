import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { DownloadContext } from '@/context/download-context'
import { useEffectsLayer } from '@/context/effects-context'

const TOTAL_KB = 248
const CHUNKS = 14
const DURATION = 1.05

/** Slow to first byte, then the stream opens up. */
const transferCurve = (t: number) => Math.min(1, t < 0.32 ? t * 0.55 : 0.176 + (t - 0.32) * 1.21)

const LOG: readonly (readonly [number, string])[] = [
  [0, '↳ dns · adarsh.dev resolved'],
  [150, '↳ tls handshake · h2 · aes-256-gcm'],
  [320, '↳ 200 OK  application/pdf  cache: MISS'],
  [620, '↳ streaming 14 chunks from object store …'],
  [1010, '✓ transfer complete · 248 KB in 1.0s'],
]

/** Held open just long enough to read the last line. */
const LINGER_MS = 380

function Chunk({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const filled = useTransform(progress, (v) => Math.floor(v * CHUNKS) > index)
  const background = useTransform(filled, (on) =>
    on ? 'linear-gradient(180deg,#a8bcff,#7c9cff)' : 'rgb(255 255 255 / 0.07)',
  )
  const boxShadow = useTransform(progress, (v) =>
    Math.floor(v * CHUNKS) - 1 === index ? '0 0 12px rgb(124 156 255 / 0.8)' : 'none',
  )

  return <motion.div style={{ background, boxShadow }} className="h-4 flex-1 rounded-[3px]" />
}

export function DownloadProvider({ children }: { children: ReactNode }) {
  const { burst } = useEffectsLayer()
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [status, setStatus] = useState('···')
  const progress = useMotionValue(0)
  const timers = useRef<number[]>([])

  const width = useTransform(progress, (v) => `${v * 100}%`)
  const bytes = useTransform(progress, (v) => `${Math.round(v * TOTAL_KB)} KB / ${TOTAL_KB} KB`)
  const rate = useTransform(progress, (v) => `${110 + Math.round(Math.sin(v * 22) * 26)} KB/s`)

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const play = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()

    clearTimers()
    setLog([])
    setStatus('···')
    setOpen(true)
    progress.set(0)

    LOG.forEach(([at, line]) => {
      timers.current.push(window.setTimeout(() => setLog((rows) => [...rows, line]), at))
    })
    timers.current.push(window.setTimeout(() => setStatus('200 OK'), 320))

    return animate(progress, 1, { duration: DURATION, ease: transferCurve }).finished.then(() => {
      burst(window.innerWidth / 2, window.innerHeight / 2, 54, 8)
      timers.current.push(window.setTimeout(() => setOpen(false), LINGER_MS))
    })
  }, [burst, clearTimers, progress])

  const value = useMemo(() => ({ play }), [play])

  return (
    <DownloadContext value={value}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              clearTimers()
              setOpen(false)
            }}
            className="fixed inset-0 z-[94] flex items-center justify-center bg-[rgb(7_8_12/0.74)] p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-[min(470px,100%)] rounded-[18px] border border-[rgb(255_255_255/0.14)] bg-[rgb(11_13_20/0.93)] p-5.5 font-mono text-xs text-[#e9ecf5] shadow-[0_26px_70px_-22px_rgb(0_0_0/0.92)]"
            >
              <div className="flex items-center gap-2.25">
                <span className="size-2 rounded-full bg-[#4be3c1] shadow-[0_0_10px_#4be3c1]" />
                <span className="tracking-[0.1em] text-[rgb(233_236_245/0.62)]">
                  GET /adarsh-resume.pdf
                </span>
                <span
                  className={`ml-auto ${status === '200 OK' ? 'text-[#4be3c1]' : 'text-[#7c9cff]'}`}
                >
                  {status}
                </span>
              </div>

              <div className="mt-3.75 h-1 overflow-hidden rounded-full bg-[rgb(255_255_255/0.09)]">
                <motion.div
                  style={{ width }}
                  className="h-full rounded-full bg-linear-to-r from-[#7c9cff] to-[#4be3c1] shadow-[0_0_12px_rgb(124_156_255/0.7)]"
                />
              </div>

              <div className="mt-1.75 flex justify-between text-[10.5px] text-[rgb(233_236_245/0.44)]">
                <motion.span>{bytes}</motion.span>
                <motion.span>{rate}</motion.span>
              </div>

              <div className="mt-3.75 flex gap-1">
                {Array.from({ length: CHUNKS }, (_, i) => (
                  <Chunk key={i} index={i} progress={progress} />
                ))}
              </div>

              <ul className="mt-3.75 flex min-h-23 flex-col gap-1.5 text-[11px] text-[rgb(233_236_245/0.52)]">
                <AnimatePresence initial={false}>
                  {log.map((line) => (
                    <motion.li
                      key={line}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={line.startsWith('✓') ? 'text-[#4be3c1]' : undefined}
                    >
                      {line}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DownloadContext>
  )
}

