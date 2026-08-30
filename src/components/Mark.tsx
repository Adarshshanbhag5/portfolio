import type { ReactNode } from 'react'

/** Lifts a fragment out of muted body copy. */
export function Mark({ children }: { children: ReactNode }) {
  return <span className="text-ink">{children}</span>
}
