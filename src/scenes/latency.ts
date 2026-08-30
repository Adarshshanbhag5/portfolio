import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const BUCKETS = 22
const SPIKE_CHANCE = 0.02

interface LatencyState {
  buckets: number[]
}

/** Query latency spread, with the p50 and p99 lines called out. */
export const latencyScene = defineScene<LatencyState>({
  create: () => ({ buckets: Array.from({ length: BUCKETS }, () => rnd(0.15, 0.6)) }),

  draw({ buckets }, { ctx, w, h, dt, palette, emit }) {
    const step = dt * 60
    for (let i = 0; i < buckets.length; i++) {
      buckets[i] = Math.max(0.08, Math.min(1, buckets[i] + rnd(-0.05, 0.05) * step))
    }
    if (Math.random() < SPIKE_CHANCE) {
      buckets[Math.floor(Math.random() * buckets.length)] = rnd(0.8, 1)
    }

    const barW = (w - 8) / buckets.length
    const plotH = h - 26
    buckets.forEach((value, i) => {
      const barH = value * plotH
      const gradient = ctx.createLinearGradient(0, h - barH, 0, h - 8)
      gradient.addColorStop(0, value > 0.78 ? palette.a3 : palette.a1)
      gradient.addColorStop(1, inkAlpha(palette, 0.06))
      ctx.fillStyle = gradient
      ctx.fillRect(4 + i * barW, h - 8 - barH, barW - 2.5, barH)
    })

    const sorted = [...buckets].sort((a, b) => a - b)
    const p50 = sorted[Math.floor(sorted.length * 0.5)]
    const p99 = sorted[sorted.length - 1]

    ctx.font = monoFont(8.5)
    for (const [value, label, color] of [
      [p50, 'p50', palette.a2],
      [p99, 'p99', palette.a3],
    ] as const) {
      const y = h - 8 - value * plotH
      ctx.lineWidth = 1
      ctx.strokeStyle = color
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(4, y)
      ctx.lineTo(w - 4, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = color
      ctx.fillText(label, w - 22, y - 3)
    }

    emit('p99', `p99 ${Math.round(40 + p99 * 180)}ms`)
  },
})
