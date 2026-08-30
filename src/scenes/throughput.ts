import { rnd } from '@/lib/random'
import { defineScene } from '@/scenes/types'

const SAMPLES = 60
const SAMPLE_HZ = 60

interface ThroughputState {
  series: number[]
  phase: number
  /** Leftover time, so the series advances at a fixed rate on any display. */
  carry: number
}

const nextSample = (phase: number) =>
  Math.max(
    0.08,
    Math.min(0.97, 0.52 + Math.sin(phase) * 0.18 + Math.sin(phase * 2.7) * 0.09 + rnd(-0.07, 0.07)),
  )

/** The hero's API throughput sparkline. */
export const throughputScene = defineScene<ThroughputState>({
  create: () => ({
    series: Array.from({ length: SAMPLES }, () => rnd(0.4, 0.62)),
    phase: 0,
    carry: 0,
  }),

  draw(s, { ctx, w, h, dt, theme, palette, emit }) {
    s.carry += dt
    const stepTime = 1 / SAMPLE_HZ
    while (s.carry >= stepTime) {
      s.carry -= stepTime
      s.phase += 0.05
      s.series.shift()
      s.series.push(nextSample(s.phase))
    }

    const trace = () => {
      ctx.beginPath()
      s.series.forEach((v, i) => {
        const x = (i / (s.series.length - 1)) * w
        const y = h - v * (h - 6) - 3
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      })
    }

    const fill = ctx.createLinearGradient(0, 0, 0, h)
    fill.addColorStop(0, theme === 'dark' ? 'rgb(75 227 193 / 0.34)' : 'rgb(14 142 117 / 0.24)')
    fill.addColorStop(1, 'rgb(75 227 193 / 0)')
    trace()
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()

    trace()
    ctx.strokeStyle = palette.a2
    ctx.lineWidth = 1.6
    ctx.lineJoin = 'round'
    ctx.shadowColor = palette.a2
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0

    const last = s.series[s.series.length - 1]
    ctx.fillStyle = palette.a2
    ctx.beginPath()
    ctx.arc(w - 1, h - last * (h - 6) - 3, 2.4, 0, Math.PI * 2)
    ctx.fill()

    emit('rps', `${Math.round(340 + last * 900)} req/s`)
    emit('p99', `p99 ${Math.round(64 + last * 70)}ms · 0 dropped`)
  },
})
