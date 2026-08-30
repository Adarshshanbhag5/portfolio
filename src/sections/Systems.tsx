import { motion } from 'motion/react'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { BrandIcon } from '@/components/BrandIcon'
import { SectionHeading } from '@/components/SectionHeading'
import { useCanvasScene } from '@/hooks/useCanvasScene'
import { dealIn, grid, reveal, riseSmall } from '@/lib/motion'
import { kafkaScene } from '@/scenes/kafka'
import { kubernetesScene } from '@/scenes/kubernetes'
import { latencyScene } from '@/scenes/latency'
import { orderBookScene } from '@/scenes/orderBook'
import { queueScene } from '@/scenes/queue'
import { workflowScene } from '@/scenes/workflow'
import type { Scene } from '@/scenes/types'

type Tone = 'a1' | 'a2' | 'a3' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  a1: 'text-a1',
  a2: 'text-a2',
  a3: 'text-a3',
  muted: 'text-muted',
}

interface SystemCardProps<State> {
  /** Position in the grid; picks the edge the card arrives from. */
  order: number
  /** Key the scene emits its readout under. */
  readoutKey: string
  initialReadout: string
  scene: Scene<State>
  label: string
  labelTone: Tone
  readoutTone: Tone
  logo?: { slug: string; mono?: boolean }
  /** Text badge for brands the icon CDN has no mark for. */
  badge?: string
  title: string
  children: ReactNode
}

function SystemCard<State>({
  order,
  readoutKey,
  initialReadout,
  scene,
  label,
  labelTone,
  readoutTone,
  logo,
  badge,
  title,
  children,
}: SystemCardProps<State>) {
  const readout = useRef<HTMLSpanElement>(null)
  const canvasRef = useCanvasScene(scene, { [readoutKey]: readout })

  return (
    <motion.article
      variants={dealIn}
      custom={order}
      className="rounded-[20px] border border-line bg-linear-to-b from-[color-mix(in_srgb,var(--pf-txt)_5%,transparent)] to-[color-mix(in_srgb,var(--pf-txt)_1.5%,transparent)] p-5 backdrop-blur-[18px] transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-line-2"
    >
      <div className="flex items-center gap-2.25">
        {logo && <BrandIcon slug={logo.slug} mono={logo.mono} className="h-4" />}
        {badge && <span className="font-mono text-[11px] font-bold text-faint">{badge}</span>}
        <span className={`font-mono text-[10.5px] tracking-[0.14em] ${TONE_CLASS[labelTone]}`}>
          {label}
        </span>
        <span ref={readout} className={`ml-auto font-mono text-[10.5px] ${TONE_CLASS[readoutTone]}`}>
          {initialReadout}
        </span>
      </div>

      <canvas ref={canvasRef} className="mt-3.5 block h-33 w-full" />

      <h3 className="mt-3.5 text-[19px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-[1.6] text-muted">{children}</p>
    </motion.article>
  )
}

export function Systems() {
  return (
    <section
      id="systems"
      className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,40px)] pt-[clamp(66px,10vw,120px)]"
    >
      <SectionHeading
        index="02"
        label="SYSTEMS"
        title="The things I keep running."
        aside={
          <motion.span
            {...reveal(riseSmall)}
            className="pb-1.5 font-mono text-[10px] tracking-[0.14em] text-faint"
          >
            SIMULATED · ILLUSTRATIVE ONLY
          </motion.span>
        }
      />

      <motion.div
        {...reveal(grid())}
        className="mt-[clamp(30px,4.5vw,50px)] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]"
      >
        <SystemCard
          order={0}
          scene={kafkaScene}
          readoutKey="lag"
          labelTone="a1"
          readoutTone="a3"
          initialReadout="lag 0"
          label="KAFKA · MSK"
          logo={{ slug: 'apachekafka', mono: true }}
          title="Event streaming"
        >
          Producers write, consumer groups chase the offset. Partitions keep ordering; lag is the
          metric that matters.
        </SystemCard>

        <SystemCard
          order={1}
          scene={queueScene}
          readoutKey="depth"
          labelTone="a2"
          readoutTone="muted"
          badge="AWS"
          initialReadout="depth 0"
          label="SQS · WORKERS"
          title="Queues & worker pools"
        >
          Work lands on a queue, a pool drains it. Visibility timeouts, dead letters and
          back-pressure instead of dropped jobs.
        </SystemCard>

        <SystemCard
          order={2}
          scene={kubernetesScene}
          readoutKey="pods"
          labelTone="a1"
          readoutTone="muted"
          initialReadout="0/0"
          label="EKS · CONTROL PLANE"
          logo={{ slug: 'kubernetes' }}
          title="Scheduling & self-healing"
        >
          Desired state versus actual. Pods get scheduled, die, and get rescheduled. The deploy
          shouldn't wake anyone up.
        </SystemCard>

        <SystemCard
          order={3}
          scene={workflowScene}
          readoutKey="state"
          labelTone="a2"
          readoutTone="muted"
          initialReadout="idle"
          label="TEMPORAL · WORKFLOW"
          logo={{ slug: 'temporal', mono: true }}
          title="Durable orchestration"
        >
          Long-running flows that survive restarts. When a vendor 500s, the activity retries and
          the workflow doesn't lose its place.
        </SystemCard>

        <SystemCard
          order={4}
          scene={orderBookScene}
          readoutKey="spread"
          labelTone="a3"
          readoutTone="muted"
          initialReadout="spread 0.00"
          label="FIX · ORDER BOOK"
          title="Order flow & execution"
        >
          Bids and asks on the book, orders routed over FIX, execution reports coming back into the
          workflow that placed them.
        </SystemCard>

        <SystemCard
          order={5}
          scene={latencyScene}
          readoutKey="p99"
          labelTone="a1"
          readoutTone="a2"
          initialReadout="p99 0ms"
          label="LATENCY · PGBOUNCER"
          logo={{ slug: 'postgresql' }}
          title="Query paths & caching"
        >
          Bulk upserts in the millions, indexes that earn their keep, and a cache in front so the
          client never waits on the DB.
        </SystemCard>
      </motion.div>
    </section>
  )
}
