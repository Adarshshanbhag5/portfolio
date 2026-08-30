import { SECTIONS } from '@/content/site'
import { cn } from '@/lib/cn'

interface DotRailProps {
  active: string
}

/** Section index down the right edge. Hidden when it would crowd the content. */
export function DotRail({ active }: DotRailProps) {
  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 right-5 z-45 hidden -translate-y-1/2 flex-col items-end gap-3.5 min-[1120px]:flex"
    >
      {SECTIONS.map(({ id, index, label }) => {
        const current = id === active
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-label={label}
            aria-current={current ? 'true' : undefined}
            className={cn(
              'flex items-center gap-2.25 transition-colors',
              current ? 'text-a2' : 'text-faint',
            )}
          >
            <span className="font-mono text-[9.5px] tracking-[0.14em]">{index}</span>
            <span
              className={cn(
                'rounded-full bg-current transition-all duration-250',
                current ? 'size-2.75 shadow-[0_0_12px_currentColor]' : 'size-1.75',
              )}
            />
          </a>
        )
      })}
    </nav>
  )
}
