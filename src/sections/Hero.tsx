import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Chip } from '@/components/Chip'
import { CountUp } from '@/components/CountUp'
import { PROFILE } from '@/content/site'
import { useBurstOnClick } from '@/hooks/useBurstOnClick'
import { useCanvasScene } from '@/hooks/useCanvasScene'
import { useEasterEggs } from '@/hooks/useEasterEggs'
import { useMagnetic } from '@/hooks/useMagnetic'
import { useScrambleOnHover } from '@/hooks/useScrambleOnHover'
import { heroBlur, heroFade, heroRise } from '@/lib/motion'
import { throughputScene } from '@/scenes/throughput'

const TAGS = ['fintech', 'market data', 'order flow · FIX', 'distributed systems']

interface Stat {
  value: number
  label: string
  suffix?: string
  unit?: string
}

const STATS: readonly Stat[] = [
  { value: 2, suffix: '+', unit: 'yrs', label: 'SHIPPING TO PRODUCTION' },
  { value: 18, label: 'GLOBAL EXCHANGES WIRED' },
  { value: 3, suffix: 'M', label: 'RECORDS PER SYNC JOB' },
]

const PILL =
  'rounded-full px-5 py-3.25 font-mono text-xs tracking-[0.06em] transition-[filter,transform,color,background-color,border-color]'

interface HeroProps {
  /** Held back until the cold-start overlay has cleared. */
  introComplete: boolean
}

export function Hero({ introComplete }: HeroProps) {
  const headerRef = useRef<HTMLElement>(null)
  // Hand the hero off to the next section rather than letting it scroll away flat.
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ['start start', 'end start'],
  })
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70])

  const magnetic = useMagnetic()
  const scrambleRef = useScrambleOnHover<HTMLSpanElement>()
  const burst = useBurstOnClick()
  const { deploy } = useEasterEggs()

  const rps = useRef<HTMLSpanElement>(null)
  const p99 = useRef<HTMLSpanElement>(null)
  const sparkRef = useCanvasScene(throughputScene, { rps, p99 })

  return (
    <motion.header
      ref={headerRef}
      id="top"
      initial="hidden"
      animate={introComplete ? 'visible' : 'hidden'}
      {...magnetic.handlers}
      className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,40px)] pt-[clamp(118px,16vh,190px)]"
    >
      <motion.div style={{ opacity: contentOpacity, y: contentY }}>
      <motion.div
        variants={heroFade}
        className="inline-flex items-center gap-2.25 rounded-full border border-line bg-panel py-1.5 pr-3.25 pl-2.5 backdrop-blur-[12px]"
      >
        <span className="animate-blink size-1.75 rounded-full bg-a2 shadow-[0_0_10px_var(--pf-a2)]" />
        <span className="font-mono text-[11px] tracking-[0.1em] text-muted">
          open to backend engineering opportunities
        </span>
      </motion.div>

      <motion.div style={magnetic.style}>
        <motion.h1
          variants={heroBlur}
          custom={0.04}
          className="mt-5.5 text-[clamp(40px,8.6vw,108px)] leading-[0.98] font-bold tracking-[-0.045em]"
        >
          I build backends
          <br />
          that{' '}
          <span
            ref={scrambleRef}
            className="bg-[linear-gradient(100deg,var(--pf-a1)_10%,var(--pf-a2)_60%,var(--pf-a3))] bg-clip-text text-transparent"
          >
            hold up
          </span>{' '}
          under load.
        </motion.h1>
      </motion.div>

      <div className="mt-[clamp(30px,4vw,46px)] flex flex-wrap gap-8 gap-x-[clamp(28px,5vw,64px)]">
        <motion.div variants={heroRise} custom={0.16} className="min-w-0 flex-[1_1_380px]">
          <p className="max-w-[48ch] text-[clamp(16px,1.55vw,19.5px)] leading-[1.6] text-pretty text-muted">
            I design and run backend services for financial platforms. Market data, order flow and
            event-driven workflows, in <span className="text-ink">TypeScript</span> and{' '}
            <span className="text-ink">Go</span>. Backend-heavy, with enough React and React Native
            to ship the client too.
          </p>
          <div className="mt-4.5 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={heroRise}
          custom={0.26}
          className="min-w-60 flex-[0_1_320px] rounded-2xl border border-line bg-panel px-4 pt-3.5 pb-3 backdrop-blur-[16px]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.16em] text-faint">
              API THROUGHPUT
            </span>
            <span ref={rps} className="font-mono text-[11.5px] text-a2">
              0 req/s
            </span>
          </div>
          <canvas ref={sparkRef} className="mt-2 block h-[62px] w-full" />
          <div className="mt-1.5 flex items-center gap-1.75 font-mono text-[10px] text-faint">
            <span className="animate-blink size-1.5 rounded-full bg-a2 [--blink-duration:1.4s]" />
            <span ref={p99}>p99 0ms · 0 dropped</span>
          </div>
        </motion.div>
      </div>

      <motion.div variants={heroFade} custom={0.35} className="mt-7.5 flex flex-wrap gap-3">
        <a
          href="#work"
          onClick={burst}
          className={`${PILL} bg-linear-to-b/srgb from-[#b7f5e6] to-a2 text-[#07080c] shadow-[0_10px_30px_-12px_rgb(75_227_193/0.8)] hover:-translate-y-px hover:brightness-108`}
        >
          see the work →
        </a>
        <a
          href={`mailto:${PROFILE.email}`}
          onClick={burst}
          className={`${PILL} border border-line bg-panel text-ink backdrop-blur-[12px] hover:border-line-2 hover:bg-panel-2`}
        >
          email me
        </a>
        <button
          type="button"
          onClick={deploy}
          className={`${PILL} cursor-pointer border border-dashed border-line-2 text-muted hover:border-a3 hover:text-a3`}
        >
          deploy to prod ⏎
        </button>
      </motion.div>

      <motion.div
        variants={heroFade}
        custom={0.44}
        className="mt-[clamp(40px,5.5vw,68px)] grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr))]"
      >
        {STATS.map(({ value, suffix, unit, label }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-line bg-panel px-4.5 pt-4.5 pb-4 backdrop-blur-[14px]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r/srgb from-transparent via-a1 to-transparent opacity-60" />
            <div className="text-[clamp(30px,3.4vw,42px)] leading-none font-bold tracking-[-0.045em]">
              <CountUp to={value} suffix={suffix} />
              {unit && <span className="ml-1 text-[0.5em] text-muted">{unit}</span>}
            </div>
            <div className="mt-1.5 font-mono text-[10.5px] tracking-[0.13em] text-faint">
              {label}
            </div>
          </div>
        ))}
      </motion.div>
      </motion.div>
    </motion.header>
  )
}
