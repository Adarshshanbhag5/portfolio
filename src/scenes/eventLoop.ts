import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const PHASES = ['timers', 'pending', 'poll', 'check', 'close'] as const
const LANES = ['fs', 'dns', 'crypto', 'zlib', 'http'] as const
const TAU = Math.PI * 2
const SEGMENT = TAU / PHASES.length

/** Trailing arcs behind the phase cursor. */
const TAIL = 7
const TAIL_STEP = 0.055
/** Ring thickness as a share of its radius, so the track scales with the page. */
const BAND_RATIO = 0.115
const MIN_BAND = 13
/** Gap between segments, in radians. */
const SEGMENT_GAP = 0.045
/** How far outside the ring a task starts its approach. */
const APPROACH = 1.8
const ORBIT_RADIUS = 27

interface Task {
  angle: number
  /** 0 while still flying in, 1 once it is sitting on the ring. */
  arrival: number
  /** 0 until the cursor sweeps it, then grows as it falls to the centre. */
  collapse: number
  done: boolean
}

interface Ripple {
  angle: number
  t: number
}

interface Microtask {
  t: number
  offset: number
}

interface Lane {
  name: string
  t: number
  speed: number
}

interface EventLoopState {
  angle: number
  elapsed: number
  spawnIn: number
  tasks: Task[]
  microtasks: Microtask[]
  ripples: Ripple[]
  lanes: Lane[]
}

const easeOut = (t: number) => 1 - (1 - t) ** 3
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * Node's event loop: callbacks arrive from outside, wait on the ring until the
 * phase cursor reaches them, then collapse into the centre and leave a
 * microtask spinning behind. The libuv threadpool runs underneath.
 */
export const eventLoopScene = defineScene<EventLoopState>({
  alwaysRun: true,
  minWidth: 560,
  maxDpr: 1.5,

  create: () => ({
    angle: 0,
    elapsed: 0,
    spawnIn: 0,
    tasks: [],
    microtasks: [],
    ripples: [],
    lanes: LANES.map((name) => ({ name, t: Math.random(), speed: rnd(0.16, 0.42) })),
  }),

  draw(s, { ctx, w, h, dt, palette }) {
    s.elapsed += dt
    s.angle = (s.angle + dt * 0.62) % TAU

    const cx = w * 0.78
    const cy = h * 0.4
    const base = Math.max(110, Math.min(210, Math.min(w, h) * 0.26))
    // A slow breath keeps the ring from reading as a static graphic.
    const r = base * (1 + Math.sin(s.elapsed * 0.5) * 0.012)
    const band = Math.max(MIN_BAND, r * BAND_RATIO)

    ctx.lineCap = 'butt'

    // The track: five phase segments wide enough to read as a loop at a glance.
    PHASES.forEach((phase, i) => {
      const start = i * SEGMENT + SEGMENT_GAP
      const end = (i + 1) * SEGMENT - SEGMENT_GAP
      const hot = s.angle > start && s.angle < end

      ctx.lineWidth = band
      ctx.strokeStyle = hot
        ? `color-mix(in srgb, ${palette.a2} 55%, transparent)`
        : inkAlpha(palette, 0.11)
      ctx.beginPath()
      ctx.arc(cx, cy, r, start, end)
      ctx.stroke()

      // A hairline on the outer edge gives the band a defined lip.
      ctx.lineWidth = 1
      ctx.strokeStyle = hot ? palette.a2 : inkAlpha(palette, 0.2)
      ctx.beginPath()
      ctx.arc(cx, cy, r + band / 2, start, end)
      ctx.stroke()

      const mid = (start + end) / 2
      ctx.font = monoFont(hot ? 11 : 10)
      ctx.fillStyle = hot ? palette.a2 : inkAlpha(palette, 0.42)
      const label = phase
      const lx = cx + Math.cos(mid) * (r + band / 2 + 16)
      const ly = cy + Math.sin(mid) * (r + band / 2 + 16)
      ctx.fillText(label, lx - ctx.measureText(label).width / 2, ly + 3.5)
    })

    // Cursor, drawn as a comet so the direction of travel is obvious.
    ctx.lineCap = 'butt'
    for (let k = TAIL; k >= 1; k--) {
      const fade = 1 - k / (TAIL + 1)
      ctx.strokeStyle = palette.a1
      ctx.globalAlpha = fade * 0.34
      ctx.lineWidth = band * (0.35 + fade * 0.65)
      ctx.beginPath()
      ctx.arc(cx, cy, r, s.angle - k * TAIL_STEP - 0.1, s.angle - (k - 1) * TAIL_STEP)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.lineCap = 'round'
    ctx.strokeStyle = palette.a1
    ctx.lineWidth = band
    ctx.shadowColor = palette.a1
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.arc(cx, cy, r, s.angle - 0.11, s.angle + 0.11)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.lineCap = 'butt'

    s.spawnIn -= dt
    if (s.spawnIn <= 0) {
      s.spawnIn = rnd(0.18, 0.5)
      s.tasks.push({ angle: Math.random() * TAU, arrival: 0, collapse: 0, done: false })
    }

    for (let i = s.tasks.length - 1; i >= 0; i--) {
      const task = s.tasks[i]
      const cos = Math.cos(task.angle)
      const sin = Math.sin(task.angle)

      if (task.arrival < 1) {
        task.arrival = Math.min(1, task.arrival + dt * 2.2)
        const eased = easeOut(task.arrival)
        const rest = r + band / 2 + 7
        const from = r * APPROACH
        const radius = from + (rest - from) * eased

        // Streak behind the incoming callback.
        ctx.strokeStyle = palette.a3
        ctx.globalAlpha = (1 - task.arrival) * 0.5
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(cx + cos * (radius + 16), cy + sin * (radius + 16))
        ctx.lineTo(cx + cos * radius, cy + sin * radius)
        ctx.stroke()
        ctx.globalAlpha = 1

        ctx.fillStyle = palette.a3
        ctx.beginPath()
        ctx.arc(cx + cos * radius, cy + sin * radius, 3, 0, TAU)
        ctx.fill()
        continue
      }

      let delta = Math.abs((task.angle - s.angle + TAU * 1.5) % TAU)
      if (delta > Math.PI) delta = TAU - delta

      // Swept over by the cursor: the callback runs and queues a microtask.
      if (!task.done && delta < 0.14) {
        task.done = true
        s.microtasks.push({ t: 0, offset: Math.random() * TAU })
        s.ripples.push({ angle: task.angle, t: 0 })
      }
      if (task.done) {
        task.collapse = Math.min(1, task.collapse + dt * 1.6)
        if (task.collapse >= 1) {
          s.tasks.splice(i, 1)
          continue
        }
      }

      const rest = r + band / 2 + 7
      const radius = rest * (1 - smoothstep(task.collapse) * 0.94)
      ctx.globalAlpha = task.done ? 1 - task.collapse : 0.9
      ctx.fillStyle = task.done ? palette.a2 : palette.a3
      ctx.beginPath()
      ctx.arc(cx + cos * radius, cy + sin * radius, task.done ? 3.4 : 3, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    for (let i = s.ripples.length - 1; i >= 0; i--) {
      const ripple = s.ripples[i]
      ripple.t += dt * 1.9
      if (ripple.t >= 1) {
        s.ripples.splice(i, 1)
        continue
      }
      ctx.strokeStyle = palette.a2
      ctx.globalAlpha = (1 - ripple.t) * 0.55
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.arc(
        cx + Math.cos(ripple.angle) * (r + band / 2 + 7),
        cy + Math.sin(ripple.angle) * (r + band / 2 + 7),
        5 + ripple.t * 24,
        0,
        TAU,
      )
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Microtask queue drains as a tight orbit around the call stack.
    for (let i = s.microtasks.length - 1; i >= 0; i--) {
      const micro = s.microtasks[i]
      micro.t += dt * 1.1
      if (micro.t >= 1) {
        s.microtasks.splice(i, 1)
        continue
      }
      const angle = micro.offset + s.elapsed * 3.4
      const radius = ORBIT_RADIUS * (1 - micro.t * 0.65)
      ctx.globalAlpha = 1 - micro.t
      ctx.fillStyle = palette.a1
      ctx.beginPath()
      ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.6, 1.9, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    ctx.font = monoFont(12)
    ctx.fillStyle = inkAlpha(palette, 0.5)
    const title = 'event loop'
    ctx.fillText(title, cx - ctx.measureText(title).width / 2, cy - r * 0.34)

    ctx.font = monoFont(9.5)
    ctx.fillStyle = inkAlpha(palette, 0.3)
    const queue = `microtasks ${s.microtasks.length}`
    ctx.fillText(queue, cx - ctx.measureText(queue).width / 2, cy + 52)

    // Call stack, breathing between one and four frames.
    const depth = 1 + Math.floor((Math.sin(s.elapsed * 1.7) * 0.5 + 0.5) * 3)
    for (let i = 0; i < depth; i++) {
      ctx.fillStyle = i === depth - 1 ? palette.a2 : inkAlpha(palette, 0.2)
      ctx.fillRect(cx - 16, cy + 4 - i * 5, 32, 3.4)
    }

    const laneX = w * 0.055
    const laneW = Math.min(190, w * 0.2)
    ctx.font = monoFont(9.5)
    ctx.fillStyle = inkAlpha(palette, 0.3)
    ctx.fillText('libuv threadpool', laneX, h * 0.6 - 12)

    s.lanes.forEach((lane, i) => {
      const y = h * 0.6 + i * 15
      const x0 = laneX + 34

      ctx.strokeStyle = inkAlpha(palette, 0.12)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x0 + laneW, y)
      ctx.stroke()

      ctx.fillStyle = inkAlpha(palette, 0.28)
      ctx.fillText(lane.name, laneX, y + 3)

      lane.t += dt * lane.speed
      if (lane.t > 1.25) {
        lane.t = 0
        lane.speed = rnd(0.16, 0.42)
      }

      const progress = Math.min(1, lane.t)
      const x = x0 + laneW * progress
      const done = lane.t > 1

      // Work already done glows behind the head of the job.
      ctx.strokeStyle = done ? palette.a2 : palette.a1
      ctx.globalAlpha = 0.42
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.fillStyle = done ? palette.a2 : palette.a1
      if (done) {
        ctx.shadowColor = palette.a2
        ctx.shadowBlur = 8
      }
      ctx.beginPath()
      ctx.arc(x, y, 2.6, 0, TAU)
      ctx.fill()
      ctx.shadowBlur = 0
    })
  },
})
