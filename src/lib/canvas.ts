export interface Surface {
  ctx: CanvasRenderingContext2D
  /** CSS pixels, not device pixels — draw in these. */
  w: number
  h: number
}

/**
 * Size the backing store to the device pixel ratio, scale the context to match,
 * and hand back a cleared surface measured in CSS pixels.
 */
export function fitCanvas(el: HTMLCanvasElement): Surface | null {
  const ctx = el.getContext('2d')
  if (!ctx) return null

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = el.clientWidth
  const h = el.clientHeight
  const bw = Math.round(w * dpr)
  const bh = Math.round(h * dpr)

  if (el.width !== bw || el.height !== bh) {
    el.width = bw
    el.height = bh
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return { ctx, w, h }
}

export const MONO_FONT = '"JetBrains Mono Variable", ui-monospace, monospace'

/** `500 9px "JetBrains Mono Variable", …` — the scenes' only text style. */
export const monoFont = (px: number) => `500 ${px}px ${MONO_FONT}`
