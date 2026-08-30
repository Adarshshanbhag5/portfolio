import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const PARTITIONS = 4
const MAX_LAG = 150
const WINDOW = 260

interface Partition {
  produced: number
  consumed: number
  produceRate: number
  consumeRate: number
}

interface KafkaState {
  partitions: Partition[]
}

/** Producers running ahead of a consumer group that scales with its own lag. */
export const kafkaScene = defineScene<KafkaState>({
  create: () => ({
    partitions: Array.from({ length: PARTITIONS }, () => {
      const produced = rnd(120, 400)
      return {
        produced,
        consumed: produced - rnd(5, 60),
        produceRate: rnd(14, 34),
        consumeRate: rnd(12, 32),
      }
    }),
  }),

  draw({ partitions }, { ctx, w, h, dt, palette, emit }) {
    const lane = h / partitions.length
    const x0 = 26
    const x1 = w - 8
    const span = x1 - x0
    let totalLag = 0

    ctx.font = monoFont(9)
    ctx.lineCap = 'round'

    partitions.forEach((p, i) => {
      p.produced += p.produceRate * dt

      // Consumers speed up as lag grows — that feedback is the whole metric.
      let lag = Math.max(0, p.produced - p.consumed)
      const effective = p.consumeRate * (0.7 + Math.min(2.8, lag / 38))
      p.consumed = Math.min(p.produced, p.consumed + effective * dt)
      lag = Math.max(0, p.produced - p.consumed)
      if (lag > MAX_LAG) {
        p.consumed = p.produced - MAX_LAG
        lag = MAX_LAG
      }
      if (Math.random() < 0.004) p.consumeRate = rnd(14, 30)
      if (Math.random() < 0.004) p.produceRate = rnd(12, 40)
      totalLag += lag

      const y = i * lane + lane / 2
      const consumedX = x0 + ((p.consumed % WINDOW) / WINDOW) * span
      const producedX = Math.min(x1, consumedX + (lag / MAX_LAG) * span * 0.55)

      ctx.lineWidth = 8
      ctx.strokeStyle = inkAlpha(palette, 0.14)
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x1, y)
      ctx.stroke()

      ctx.strokeStyle = palette.a1
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(consumedX, y)
      ctx.stroke()

      ctx.strokeStyle = lag > 60 ? palette.a3 : inkAlpha(palette, 0.3)
      ctx.beginPath()
      ctx.moveTo(consumedX, y)
      ctx.lineTo(Math.max(consumedX, producedX), y)
      ctx.stroke()

      ctx.fillStyle = palette.a2
      ctx.shadowColor = palette.a2
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(consumedX, y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = inkAlpha(palette, 0.45)
      ctx.fillText(`p${i}`, 6, y + 3)
    })

    emit('lag', `lag ${Math.round(totalLag)}`)
  },
})
