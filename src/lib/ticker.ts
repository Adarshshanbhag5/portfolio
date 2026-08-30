type Tick = (dt: number) => void

const subscribers = new Set<Tick>()
let frameId = 0
let previous = 0

/** Cap the delta so a backgrounded tab does not resume with a huge jump. */
const MAX_STEP = 1 / 20

function frame(now: number) {
  const dt = Math.min(MAX_STEP, (now - previous) / 1000)
  previous = now
  for (const tick of subscribers) tick(dt)
  frameId = requestAnimationFrame(frame)
}

/**
 * One requestAnimationFrame loop shared by every canvas scene. Ten independent
 * loops would each pay their own callback and layout cost for no benefit.
 */
export function subscribeToTicker(tick: Tick) {
  subscribers.add(tick)
  if (!frameId) {
    previous = performance.now()
    frameId = requestAnimationFrame(frame)
  }
  return () => {
    subscribers.delete(tick)
    if (!subscribers.size && frameId) {
      cancelAnimationFrame(frameId)
      frameId = 0
    }
  }
}
