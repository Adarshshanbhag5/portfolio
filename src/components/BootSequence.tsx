import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { BOOT_LOG, PROFILE } from '@/content/site'

const PROGRESS_MS = 1000
const CARD_EXIT_MS = 940
const TOTAL_MS = 1520
const NAME_START = 1.04
const CHAR_STEP = 0.024
const EASE = [0.16, 1, 0.3, 1] as const

const FIRST = 'ADARSH'
const LAST = 'SHANBHAG'

function NameChar({ char, delay, className }: { char: string; delay: number; className: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 40, rotate: 6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.38, delay, ease: EASE }}
      className={className}
    >
      {char}
    </motion.span>
  )
}

/**
 * The cold-start card. Skippable by clicking, and skipped outright when the
 * visitor has asked for reduced motion.
 */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  const [cardGone, setCardGone] = useState(false)
  const percent = useMotionValue(0)
  const label = useTransform(percent, (v) => `${String(Math.round(v)).padStart(3, '0')}%`)
  const barWidth = useTransform(percent, (v) => `${v}%`)

  useEffect(() => {
    const controls = animate(percent, 100, { duration: PROGRESS_MS / 1000, ease: 'linear' })
    const card = setTimeout(() => setCardGone(true), CARD_EXIT_MS)
    const done = setTimeout(() => setVisible(false), TOTAL_MS)
    return () => {
      controls.stop()
      clearTimeout(card)
      clearTimeout(done)
    }
  }, [percent])

  // Nothing behind the overlay should scroll while it is up.
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          initial={{ clipPath: 'inset(0 0 0 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.34, ease: [0.7, 0, 0.2, 1] }}
          onClick={() => setVisible(false)}
          role="presentation"
          className="fixed inset-0 z-[95] flex cursor-pointer items-center justify-center overflow-hidden bg-[rgb(7_8_12/0.94)] p-6 backdrop-blur-lg"
        >
          <motion.div
            initial={{ opacity: 0, filter: 'blur(14px)', y: 20, scale: 0.98 }}
            animate={
              cardGone
                ? { opacity: 0, y: -18, scale: 0.94 }
                : { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }
            }
            transition={{ duration: cardGone ? 0.28 : 0.42, ease: cardGone ? [0.6, 0, 0.2, 1] : EASE }}
            className="w-[min(520px,100%)] rounded-[18px] border border-[rgb(255_255_255/0.1)] bg-linear-to-b from-[rgb(255_255_255/0.06)] to-[rgb(255_255_255/0.02)] px-6 pt-6 pb-5 text-[#e9ecf5] shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_24px_60px_-20px_rgb(0_0_0/0.75)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="animate-blink size-2.25 rounded-full bg-[#4be3c1] shadow-[0_0_12px_#4be3c1] [--blink-duration:1.1s]" />
              <span className="font-mono text-[11px] tracking-[0.18em] text-[rgb(233_236_245/0.6)]">
                COLD START
              </span>
              <motion.span className="ml-auto font-mono text-[11px] tracking-[0.14em] text-[#7c9cff]">
                {label}
              </motion.span>
            </div>

            <div className="mt-4.5 text-[clamp(26px,5.4vw,40px)] leading-[1.02] font-bold tracking-[-0.04em]">
              {PROFILE.name}
            </div>
            <div className="mt-1.5 font-mono text-[11.5px] tracking-[0.14em] text-[rgb(233_236_245/0.6)]">
              BACKEND ENGINEER · BENGALURU
            </div>

            <div className="mt-4.5 h-[3px] overflow-hidden rounded-full bg-[rgb(255_255_255/0.1)]">
              <motion.div
                style={{ width: barWidth }}
                className="h-full rounded-full bg-linear-to-r from-[#7c9cff] to-[#4be3c1] shadow-[0_0_14px_rgb(124_156_255/0.7)]"
              />
            </div>

            <ul className="mt-4 flex flex-col gap-1.25 font-mono text-[11px] text-[rgb(233_236_245/0.42)]">
              {BOOT_LOG.map(([line, status], i) => (
                <motion.li
                  key={line}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.08 + i * 0.125 }}
                >
                  {line}
                  <span className="text-[#4be3c1]"> {status}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-4.5 font-mono text-[10px] tracking-[0.16em] text-[rgb(233_236_245/0.34)]">
              CLICK TO SKIP
            </div>
          </motion.div>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-[4vw]">
            <div className="text-center text-[clamp(38px,11.5vw,158px)] leading-[0.86] font-bold tracking-[-0.055em]">
              <div>
                {[...FIRST].map((char, i) => (
                  <NameChar
                    key={`${char}-${i}`}
                    char={char}
                    delay={NAME_START + i * CHAR_STEP}
                    className="inline-block text-[#e9ecf5]"
                  />
                ))}
              </div>
              <div>
                {[...LAST].map((char, i) => (
                  <NameChar
                    key={`${char}-${i}`}
                    char={char}
                    delay={NAME_START + 0.18 + i * CHAR_STEP}
                    className="inline-block text-[#4be3c1]"
                  />
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 1.38, ease: EASE }}
              className="font-mono text-[clamp(9px,1.2vw,12px)] tracking-[0.3em] text-[rgb(233_236_245/0.5)]"
            >
              BACKEND · DISTRIBUTED SYSTEMS · FINTECH
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
