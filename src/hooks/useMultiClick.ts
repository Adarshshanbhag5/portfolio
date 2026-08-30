import { useCallback, useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'

/** Fires once `times` clicks land inside `withinMs` of each other. */
export function useMultiClick(times: number, withinMs: number, onComplete: () => void) {
  const clicks = useRef(0)
  const timer = useRef(0)
  const latest = useRef(onComplete)

  useEffect(() => {
    latest.current = onComplete
  })
  useEffect(() => () => clearTimeout(timer.current), [])

  return useCallback(
    (event: MouseEvent) => {
      clicks.current += 1
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => (clicks.current = 0), withinMs)

      if (clicks.current >= times) {
        clicks.current = 0
        event.preventDefault()
        latest.current()
      }
    },
    [times, withinMs],
  )
}
