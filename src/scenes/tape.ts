import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const SYMBOLS = [
  ['AAPL', 232.4], ['MSFT', 441.8], ['NVDA', 178.2], ['SPY', 592.1],
  ['TSLA', 341.6], ['AMZN', 214.9], ['GOOGL', 198.3], ['META', 612.7],
  ['QQQ', 518.4], ['JPM', 264.1], ['ASML', 742.5], ['D05.SI', 45.2],
] as const

const GAP = 34
const FLASH_FRAMES = 22
const SCROLL_PX_PER_SEC = 92

interface Quote {
  symbol: string
  price: number
  previous: number
  age: number
  flash: number
}

interface TapeState {
  offset: number
  quotes: Quote[]
}

/** Scrolling last-traded-price feed. */
export const tapeScene = defineScene<TapeState>({
  create: () => ({
    offset: 0,
    quotes: SYMBOLS.map(([symbol, price]) => ({
      symbol,
      price,
      previous: price,
      age: 0,
      flash: 0,
    })),
  }),

  draw(s, { ctx, w, h, dt, palette }) {
    const step = dt * 60
    s.offset -= SCROLL_PX_PER_SEC * dt

    for (const quote of s.quotes) {
      quote.age += step
      if (quote.age > rnd(26, 72)) {
        quote.age = 0
        quote.previous = quote.price
        quote.price = Math.max(1, quote.price * (1 + rnd(-0.0055, 0.0055)))
        quote.flash = FLASH_FRAMES
      }
      if (quote.flash > 0) quote.flash -= step
    }

    ctx.font = monoFont(12)
    const widths = s.quotes.map(
      (q) => ctx.measureText(`${q.symbol}  ${q.price.toFixed(2)}  ▲0.00%`).width + GAP,
    )
    const total = widths.reduce((a, b) => a + b, 0)
    if (s.offset < -total) s.offset += total

    let x = s.offset
    for (let pass = 0; pass < 3 && x < w; pass++) {
      s.quotes.forEach((quote, i) => {
        if (x > -widths[i] && x < w) {
          const up = quote.price >= quote.previous
          const change = ((quote.price - quote.previous) / quote.previous) * 100

          if (quote.flash > 0) {
            const alpha = (quote.flash / FLASH_FRAMES) * 0.16
            ctx.fillStyle = up ? `rgb(53 217 154 / ${alpha})` : `rgb(255 106 106 / ${alpha})`
            ctx.fillRect(x - 6, 6, widths[i] - GAP + 12, h - 12)
          }

          const baseline = h / 2 + 4
          ctx.fillStyle = inkAlpha(palette, 0.82)
          ctx.fillText(quote.symbol, x, baseline)

          const symbolWidth = ctx.measureText(`${quote.symbol}  `).width
          ctx.fillStyle = inkAlpha(palette, 0.55)
          ctx.fillText(quote.price.toFixed(2), x + symbolWidth, baseline)

          const priceWidth = ctx.measureText(`${quote.price.toFixed(2)}  `).width
          ctx.fillStyle = up ? palette.up : palette.down
          ctx.fillText(
            `${up ? '▲' : '▼'}${Math.abs(change).toFixed(2)}%`,
            x + symbolWidth + priceWidth,
            baseline,
          )
        }
        x += widths[i]
      })
    }
  },
})
