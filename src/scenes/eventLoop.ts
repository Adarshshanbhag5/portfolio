import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const PHASES = ['timers', 'pending', 'poll', 'check', 'close'] as const
const LANES = ['fs', 'dns', 'crypto', 'zlib', 'http'] as const
const TAU = Math.PI * 2
const SEGMENT = TAU / PHASES.length

interface Task {
  angle: number
  collapse: number
  done: boolean
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
  microtasks: { t: number }[]
  lanes: Lane[]
}

/** Node's event loop phases, its microtask drain and the libuv threadpool. */
export const eventLoopScene = defineScene<EventLoopState>({
  alwaysRun: true,

  create: () => ({
    angle: 0,
    elapsed: 0,
    spawnIn: 0,
    tasks: [],
    microtasks: [],
    lanes: LANES.map((name) => ({ name, t: Math.random(), speed: rnd(0.16, 0.42) })),
  }),

  draw(s, { ctx, w, h, dt, palette }) {
    if (w < 560) return

    s.elapsed += dt
    s.angle = (s.angle + dt * 0.62) % TAU

    const cx = w * 0.78
    const cy = h * 0.44
    const r = Math.max(88, Math.min(180, Math.min(w, h) * 0.2))

    ctx.lineCap = 'butt'
    ctx.font = monoFont(8.5)

    PHASES.forEach((phase, i) => {
      const start = i * SEGMENT + 0.06
      const end = (i + 1) * SEGMENT - 0.06
      const hot = s.angle > start && s.angle < end

      ctx.strokeStyle = hot ? palette.a2 : inkAlpha(palette, 0.16)
      ctx.lineWidth = hot ? 4 : 2
      ctx.beginPath()
      ctx.arc(cx, cy, r, start, end)
      ctx.stroke()

      const mid = (start + end) / 2
      ctx.fillStyle = hot ? palette.a2 : inkAlpha(palette, 0.3)
      const lx = cx + Math.cos(mid) * (r + 15)
      const ly = cy + Math.sin(mid) * (r + 15)
      ctx.fillText(phase, lx - ctx.measureText(phase).width / 2, ly + 3)
    })

    // The cursor sweeping the ring.
    ctx.strokeStyle = palette.a1
    ctx.lineWidth = 5
    ctx.shadowColor = palette.a1
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(cx, cy, r, s.angle - 0.16, s.angle + 0.16)
    ctx.stroke()
    ctx.shadowBlur = 0

    s.spawnIn -= dt
    if (s.spawnIn <= 0) {
      s.spawnIn = rnd(0.22, 0.6)
      s.tasks.push({ angle: Math.random() * TAU, collapse: 0, done: false })
    }

    for (let i = s.tasks.length - 1; i >= 0; i--) {
      const task = s.tasks[i]
      let delta = Math.abs((task.angle - s.angle + TAU * 1.5) % TAU)
      if (delta > Math.PI) delta = TAU - delta

      // Swept over by the cursor: the callback runs and queues a microtask.
      if (!task.done && delta < 0.14) {
        task.done = true
        s.microtasks.push({ t: 0 })
      }
      if (task.done) {
        task.collapse = Math.min(1, task.collapse + dt * 1.5)
        if (task.collapse >= 1) {
          s.tasks.splice(i, 1)
          continue
        }
      }

      const radius = r * (1 - task.collapse * 0.94)
      ctx.globalAlpha = task.done ? 1 - task.collapse : 0.85
      ctx.fillStyle = task.done ? palette.a2 : palette.a3
      ctx.beginPath()
      ctx.arc(cx + Math.cos(task.angle) * radius, cy + Math.sin(task.angle) * radius, 2.6, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    for (let i = s.microtasks.length - 1; i >= 0; i--) {
      const micro = s.microtasks[i]
      micro.t += dt * 2.2
      if (micro.t > 1) {
        s.microtasks.splice(i, 1)
        continue
      }
      ctx.globalAlpha = 1 - micro.t
      ctx.fillStyle = palette.a1
      ctx.fillRect(cx - 24 + i * 6, cy + 26, 3, 3)
      ctx.globalAlpha = 1
    }

    ctx.fillStyle = inkAlpha(palette, 0.34)
    ctx.fillText('event loop', cx - 22, cy - 14)
    ctx.fillStyle = inkAlpha(palette, 0.22)
    ctx.fillText('microtasks', cx - 26, cy + 44)

    // Call stack, breathing between one and four frames.
    const depth = 1 + Math.floor((Math.sin(s.elapsed * 1.7) * 0.5 + 0.5) * 3)
    for (let i = 0; i < depth; i++) {
      ctx.fillStyle = i === depth - 1 ? palette.a2 : inkAlpha(palette, 0.2)
      ctx.fillRect(cx - 16, cy + 4 - i * 5, 32, 3.4)
    }

    const laneX = w * 0.055
    const laneW = Math.min(190, w * 0.2)
    ctx.fillStyle = inkAlpha(palette, 0.26)
    ctx.fillText('libuv threadpool', laneX, h * 0.6 - 12)

    s.lanes.forEach((lane, i) => {
      const y = h * 0.6 + i * 15
      ctx.strokeStyle = inkAlpha(palette, 0.12)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(laneX + 34, y)
      ctx.lineTo(laneX + 34 + laneW, y)
      ctx.stroke()

      ctx.fillStyle = inkAlpha(palette, 0.28)
      ctx.fillText(lane.name, laneX, y + 3)

      lane.t += dt * lane.speed
      if (lane.t > 1.25) {
        lane.t = 0
        lane.speed = rnd(0.16, 0.42)
      }
      const done = lane.t > 1
      ctx.fillStyle = done ? palette.a2 : palette.a1
      if (done) {
        ctx.shadowColor = palette.a2
        ctx.shadowBlur = 8
      }
      ctx.beginPath()
      ctx.arc(laneX + 34 + laneW * Math.min(1, lane.t), y, 2.6, 0, TAU)
      ctx.fill()
      ctx.shadowBlur = 0
    })
  },
})
