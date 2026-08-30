import { useEffect, useState } from 'react'

/** Fraction of the viewport a section must pass to become current. */
const ACTIVATION_LINE = 0.4

/**
 * The last section whose top has crossed the activation line, which is the reading
 * position, rather than whichever section happens to be largest on screen.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    let frame = 0
    // Resolved once: re-querying six ids on every scroll frame is needless.
    const sections = ids
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((s): s is { id: string; el: HTMLElement } => Boolean(s.el))

    const measure = () => {
      frame = 0
      const line = window.innerHeight * ACTIVATION_LINE
      let current = ids[0]
      for (const { id, el } of sections) {
        if (el.getBoundingClientRect().top <= line) current = id
      }
      setActive((was) => (was === current ? was : current))
    }

    const onScroll = () => {
      frame ||= requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}
