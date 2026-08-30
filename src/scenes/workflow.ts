import { monoFont } from '@/lib/canvas'
import { inkAlpha } from '@/lib/theme'
import type { Palette } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

type Tone = 'start' | 'ok' | 'warn' | 'fail' | 'muted'

/** One pass of a market-data workflow, vendor failure and retry included. */
const HISTORY: readonly (readonly [string, Tone])[] = [
  ['WorkflowExecutionStarted', 'start'],
  ['ActivityTaskScheduled  fetch_chain', 'muted'],
  ['ActivityTaskStarted', 'muted'],
  ['ActivityTaskFailed  vendor 503', 'fail'],
  ['RetryScheduled  backoff 2s', 'warn'],
  ['ActivityTaskCompleted', 'ok'],
  ['TimerStarted  5m', 'muted'],
  ['ActivityTaskScheduled  upsert_ltp', 'muted'],
  ['ActivityTaskCompleted  3.1M rows', 'ok'],
  ['WorkflowExecutionCompleted', 'ok'],
]

const ROW_HEIGHT = 17
const VISIBLE_ROWS = 7
const EVENT_INTERVAL = 0.85

interface Row {
  text: string
  tone: Tone
  y: number
  opacity: number
}

interface WorkflowState {
  rows: Row[]
  index: number
  sinceEvent: number
}

const toneColor = (tone: Tone, palette: Palette) =>
  tone === 'start'
    ? palette.a1
    : tone === 'ok'
      ? palette.a2
      : tone === 'warn'
        ? palette.a3
        : tone === 'fail'
          ? palette.down
          : inkAlpha(palette, 0.4)

export const workflowScene = defineScene<WorkflowState>({
  create: () => ({ rows: [], index: 0, sinceEvent: EVENT_INTERVAL }),

  draw(s, { ctx, w: _w, h, dt, palette, emit }) {
    s.sinceEvent += dt
    if (s.sinceEvent > EVENT_INTERVAL) {
      s.sinceEvent = 0
      const [text, tone] = HISTORY[s.index % HISTORY.length]
      s.rows.push({ text, tone, y: h - 6, opacity: 0 })
      s.index += 1
      if (s.rows.length > VISIBLE_ROWS) s.rows.shift()
    }

    s.rows.forEach((row, i) => {
      const target = 18 + i * ROW_HEIGHT
      row.y += (target - row.y) * Math.min(1, dt * 6)
      row.opacity += (1 - row.opacity) * Math.min(1, dt * 5)
    })

    ctx.lineWidth = 1
    ctx.strokeStyle = inkAlpha(palette, 0.13)
    ctx.beginPath()
    ctx.moveTo(9, 10)
    ctx.lineTo(9, h - 8)
    ctx.stroke()

    ctx.font = monoFont(9)
    s.rows.forEach((row, i) => {
      const color = toneColor(row.tone, palette)
      const isLatest = i === s.rows.length - 1
      // The oldest row fades once the timeline is full.
      ctx.globalAlpha = row.opacity * (i === 0 && s.rows.length > VISIBLE_ROWS - 1 ? 0.35 : 1)

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(9, row.y - 3, isLatest ? 3.4 : 2.4, 0, Math.PI * 2)
      ctx.fill()

      if (isLatest) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.globalAlpha = row.opacity * (0.3 + Math.sin(s.sinceEvent * 10) * 0.3)
        ctx.beginPath()
        ctx.arc(9, row.y - 3, 6.5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = row.opacity
      }

      ctx.fillStyle = inkAlpha(palette, isLatest ? 0.86 : 0.5)
      ctx.fillText(row.text, 20, row.y)
      ctx.globalAlpha = 1
    })

    const latest = s.rows.at(-1)
    if (latest) {
      const retrying = latest.tone === 'fail' || latest.tone === 'warn'
      const finished = latest.text.includes('Completed') && s.index % HISTORY.length === 0
      emit(
        'state',
        finished ? 'completed' : retrying ? 'retrying' : 'running',
        retrying ? palette.a3 : palette.a2,
      )
    }
  },
})
