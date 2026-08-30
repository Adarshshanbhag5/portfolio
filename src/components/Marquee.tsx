import type { CSSProperties } from 'react'
import { BrandIcon } from '@/components/BrandIcon'
import { MARQUEE_ROWS } from '@/content/marquee'
import type { MarqueeItem } from '@/content/marquee'
import { cn } from '@/lib/cn'

const DURATIONS = ['32s', '42s'] as const

function Track({ items }: { items: readonly MarqueeItem[] }) {
  return (
    <div className="flex gap-3 pr-3">
      {items.map(({ label, logo, mono }) => (
        <span
          key={label}
          className="inline-flex flex-none items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-2 font-mono text-[11.5px] tracking-[0.02em] whitespace-nowrap text-muted transition-[color,border-color,transform] duration-250 hover:-translate-y-0.5 hover:border-line-2 hover:text-ink"
        >
          {logo && <BrandIcon slug={logo} mono={mono} className="h-3.5" />}
          {label}
        </span>
      ))}
    </div>
  )
}

/**
 * Two counter-scrolling tool rows. Each track is rendered twice so the
 * -50% translation lands exactly on a seam.
 */
export function Marquee() {
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden border-b border-line bg-[color-mix(in_srgb,var(--pf-bg2)_26%,transparent)] py-4 backdrop-blur-[8px]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-3 w-[14%] bg-linear-to-r/srgb from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-3 w-[14%] bg-linear-to-l/srgb from-bg to-transparent" />

      {MARQUEE_ROWS.map((items, row) => (
        <div
          key={row}
          style={{ '--marquee-duration': DURATIONS[row] } as CSSProperties}
          className={cn(
            'flex w-max hover:[animation-play-state:paused]',
            row === 0 ? 'animate-marquee' : 'animate-marquee-reverse',
          )}
        >
          <Track items={items} />
          <div aria-hidden>
            <Track items={items} />
          </div>
        </div>
      ))}
    </div>
  )
}
