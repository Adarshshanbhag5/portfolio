import { useEffect, useRef } from 'react'

const BUFFER_SIZE = 8

/**
 * Fires when the user types one of `sequences` anywhere outside a text field.
 * Modified keystrokes are ignored so browser shortcuts still work.
 */
export function useKeySequence(sequences: Record<string, () => void>) {
  const latest = useRef(sequences)
  useEffect(() => {
    latest.current = sequences
  })

  useEffect(() => {
    let buffer = ''

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.isContentEditable) return
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return

      buffer = (buffer + event.key).slice(-BUFFER_SIZE).toLowerCase()
      for (const [word, run] of Object.entries(latest.current)) {
        if (buffer.endsWith(word)) {
          buffer = ''
          run()
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
