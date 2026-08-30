import type { ReactNode } from 'react'
import { BrandIcon } from '@/components/BrandIcon'
import { cn } from '@/lib/cn'

/** Accent roles a chip can be tinted with. */
export type ChipTone = 'a1' | 'a2' | 'a3'

export interface ChipProps {
  children: ReactNode
  logo?: string
  mono?: boolean
  tone?: ChipTone
  /** `sm` sits inside the work timeline; `md` inside the stack grid. */
  size?: 'sm' | 'md'
}

export function Chip({ children, logo, mono, tone, size = 'sm' }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-mono',
        size === 'sm' ? 'gap-1.5 px-2.75 py-1.25 text-[10.5px]' : 'gap-1.75 px-3 py-1.5 text-xs',
        tone ? 'text-ink' : 'border-line text-muted',
      )}
      // Mixed from the live custom property so the tint follows the theme —
      // the design hard-coded dark-theme rgba() here.
      style={
        tone
          ? {
              borderColor: `color-mix(in srgb, var(--pf-${tone}) 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--pf-${tone}) 12%, transparent)`,
            }
          : undefined
      }
    >
      {logo && <BrandIcon slug={logo} mono={mono} className={size === 'sm' ? 'h-3' : 'h-3.25'} />}
      {children}
    </span>
  )
}
