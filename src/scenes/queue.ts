import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

type MessageState = 'queued' | 'travelling' | 'processing' | 'acked'

interface Message {
  state: MessageState
  x: number
  y: number
  t: number
  lane: number
  fromX: number
  fromY: number
  target: number
  claimedBy?: number
}

interface Worker {
  busy: number
  duration: number
  message: Message | null
}

interface QueueState {
  messages: Message[]
  workers: Worker[]
  spawnIn: number
  acked: number
}

const WORKERS = 3
const MAX_IN_FLIGHT = 14
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** A queue draining into a worker pool, one visible-timeout at a time. */
export const queueScene = defineScene<QueueState>({
  create: () => ({
    messages: [],
    workers: Array.from({ length: WORKERS }, () => ({ busy: 0, duration: 0, message: null })),
    spawnIn: 0.4,
    acked: 0,
  }),

  draw(s, { ctx, w, h, dt, palette, emit }) {
    const lanes = [h * 0.26, h * 0.5, h * 0.74]
    const workerX = 30
    const queueX = w * 0.6

    s.spawnIn -= dt
    if (s.spawnIn <= 0 && s.messages.length < MAX_IN_FLIGHT) {
      s.spawnIn = rnd(0.55, 1)
      s.messages.push({
        state: 'queued',
        x: w + 20,
        y: h * 0.5,
        t: 0,
        lane: 0,
        fromX: 0,
        fromY: 0,
        target: queueX,
      })
    }

    const queued = s.messages.filter((m) => m.state === 'queued')
    queued.forEach((m, i) => (m.target = queueX + i * 20))

    s.workers.forEach((worker, lane) => {
      if (worker.busy > 0) {
        worker.busy -= dt
        if (worker.busy <= 0 && worker.message) {
          worker.message.state = 'acked'
          worker.message.t = 0
          worker.message = null
          s.acked += 1
        }
        return
      }
      if (worker.message) return

      const head = queued.find((m) => m.claimedBy === undefined && m.x < queueX + 30)
      if (!head) return
      head.claimedBy = lane
      head.state = 'travelling'
      head.t = 0
      head.fromX = head.x
      head.fromY = head.y
      head.lane = lane
      worker.message = head
      worker.busy = -1 // claimed; the real duration is set on arrival
    })

    for (let i = s.messages.length - 1; i >= 0; i--) {
      const m = s.messages[i]
      if (m.state === 'queued') {
        m.x += (m.target - m.x) * Math.min(1, dt * 3.4)
      } else if (m.state === 'travelling') {
        m.t = Math.min(1, m.t + dt * 1.5)
        const e = smoothstep(m.t)
        m.x = m.fromX + (workerX + 16 - m.fromX) * e
        m.y = m.fromY + (lanes[m.lane] - m.fromY) * e
        if (m.t >= 1) {
          m.state = 'processing'
          const worker = s.workers[m.lane]
          worker.duration = rnd(1.1, 1.9)
          worker.busy = worker.duration
          worker.message = m
        }
      } else if (m.state === 'acked') {
        m.t += dt * 1.6
        m.x -= dt * 90
        if (m.t > 1) s.messages.splice(i, 1)
      }
    }

    ctx.font = monoFont(8.5)
    ctx.lineCap = 'round'
    ctx.lineWidth = 12
    ctx.strokeStyle = inkAlpha(palette, 0.1)
    ctx.beginPath()
    ctx.moveTo(queueX - 6, h * 0.5)
    ctx.lineTo(w - 6, h * 0.5)
    ctx.stroke()

    ctx.fillStyle = inkAlpha(palette, 0.28)
    ctx.fillText('queue', queueX - 4, 12)
    ctx.fillText('workers', 6, 12)

    s.workers.forEach((worker, lane) => {
      const y = lanes[lane]
      ctx.lineWidth = 1
      ctx.strokeStyle = inkAlpha(palette, 0.16)
      ctx.beginPath()
      ctx.arc(workerX, y, 13, 0, Math.PI * 2)
      ctx.stroke()

      if (worker.busy > 0 && worker.duration > 0) {
        const progress = 1 - worker.busy / worker.duration
        ctx.lineWidth = 2.4
        ctx.strokeStyle = palette.a2
        ctx.beginPath()
        ctx.arc(workerX, y, 13, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
        ctx.stroke()

        ctx.globalAlpha = 0.22
        ctx.fillStyle = palette.a2
        ctx.beginPath()
        ctx.arc(workerX, y, 9, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      ctx.fillStyle = inkAlpha(palette, worker.busy > 0 ? 0.7 : 0.3)
      ctx.fillText(`w${lane}`, workerX - 6, y + 3)
    })

    for (const m of s.messages) {
      if (m.state === 'processing') continue
      if (m.state === 'acked') {
        ctx.globalAlpha = Math.max(0, 1 - m.t)
        ctx.fillStyle = palette.a2
        ctx.beginPath()
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        continue
      }
      ctx.fillStyle = m.state === 'travelling' ? palette.a1 : inkAlpha(palette, 0.34)
      ctx.beginPath()
      ctx.roundRect(m.x - 7.5, m.y - 4.5, 15, 9, 3)
      ctx.fill()
    }

    emit('depth', `depth ${queued.length} · acked ${s.acked}`)
  },
})
