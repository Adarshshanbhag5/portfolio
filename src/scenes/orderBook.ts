import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const LEVELS = 7
const TICK = 0.28
const TICK_SIZE = 0.05

interface Level {
  bid: number
  ask: number
}

interface BookState {
  mid: number
  levels: Level[]
  sinceTick: number
  prints: { t: number; up: boolean }[]
}

/** Bids and asks either side of the mid, with trade prints walking away. */
export const orderBookScene = defineScene<BookState>({
  create: () => ({
    mid: 232.4,
    levels: Array.from({ length: LEVELS }, () => ({ bid: rnd(0.3, 1), ask: rnd(0.3, 1) })),
    sinceTick: 0,
    prints: [],
  }),

  draw(s, { ctx, w, h, dt, theme, palette, emit }) {
    s.sinceTick += dt
    if (s.sinceTick > TICK) {
      s.sinceTick = 0
      s.mid = Math.max(1, s.mid * (1 + rnd(-0.0016, 0.0016)))
      for (const level of s.levels) {
        level.bid = Math.max(0.12, Math.min(1, level.bid + rnd(-0.22, 0.22)))
        level.ask = Math.max(0.12, Math.min(1, level.ask + rnd(-0.22, 0.22)))
      }
      if (Math.random() < 0.5) s.prints.push({ t: 0, up: Math.random() < 0.5 })
    }

    s.prints = s.prints.filter((print) => {
      print.t += dt
      return print.t < 1
    })

    const rowH = (h - 16) / (LEVELS * 2)
    const cx = w / 2
    const depthW = w / 2 - 34

    ctx.font = monoFont(8.5)
    const askFill = theme === 'dark' ? 'rgb(255 106 106 / 0.26)' : 'rgb(200 55 47 / 0.2)'
    const bidFill = theme === 'dark' ? 'rgb(53 217 154 / 0.26)' : 'rgb(15 143 95 / 0.2)'

    for (let i = 0; i < LEVELS; i++) {
      const askY = 8 + i * rowH
      const bidY = 8 + (LEVELS + i) * rowH
      const ask = s.levels[LEVELS - 1 - i]
      const bid = s.levels[i]

      ctx.fillStyle = askFill
      ctx.fillRect(cx + 26, askY + 1, depthW * ask.ask, rowH - 2)
      ctx.fillStyle = bidFill
      ctx.fillRect(cx + 26, bidY + 1, depthW * bid.bid, rowH - 2)

      ctx.fillStyle = palette.down
      ctx.fillText((s.mid + (LEVELS - i) * TICK_SIZE).toFixed(2), 8, askY + rowH - 3)
      ctx.fillStyle = palette.up
      ctx.fillText((s.mid - (i + 1) * TICK_SIZE).toFixed(2), 8, bidY + rowH - 3)
    }

    const midY = 8 + LEVELS * rowH
    ctx.lineWidth = 1
    ctx.strokeStyle = inkAlpha(palette, 0.25)
    ctx.beginPath()
    ctx.moveTo(4, midY)
    ctx.lineTo(w - 4, midY)
    ctx.stroke()

    for (const print of s.prints) {
      ctx.globalAlpha = 1 - print.t
      ctx.fillStyle = print.up ? palette.up : palette.down
      ctx.beginPath()
      ctx.arc(w - 12, midY + (print.up ? -1 : 1) * print.t * 26, 2.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    emit('spread', `mid ${s.mid.toFixed(2)} · spread ${TICK_SIZE.toFixed(2)}`)
  },
})
