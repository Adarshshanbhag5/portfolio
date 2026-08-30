import { ResumeLink } from '@/components/ResumeLink'
import { NAV_SECTIONS } from '@/content/site'
import { useTheme } from '@/context/theme-context'
import { useEasterEggs } from '@/hooks/useEasterEggs'
import { useMultiClick } from '@/hooks/useMultiClick'
import { cn } from '@/lib/cn'

interface NavProps {
  active: string
}

export function Nav({ active }: NavProps) {
  const { theme, toggleTheme } = useTheme()
  const { chaos } = useEasterEggs()
  const onBrandClick = useMultiClick(3, 900, chaos)

  return (
    <nav
      aria-label="Primary"
      className="fixed top-3.5 left-1/2 z-[60] flex w-[calc(100%-28px)] max-w-[1180px] -translate-x-1/2 items-center gap-[clamp(8px,1.4vw,20px)] rounded-full border border-line bg-[var(--pf-nav)] py-2.25 pr-2.5 pl-4 shadow-[0_12px_40px_-18px_rgb(0_0_0/0.9)] backdrop-blur-[22px] backdrop-saturate-150"
    >
      <a
        href="#top"
        onClick={onBrandClick}
        title="…try clicking me a few times"
        className="flex flex-none items-center gap-2 whitespace-nowrap text-ink"
      >
        <span className="animate-blink size-2 rounded-full bg-a2 shadow-[0_0_10px_var(--pf-a2)] [--blink-duration:2.4s]" />
        <span className="text-[clamp(12.5px,1.5vw,15px)] font-bold tracking-[-0.02em]">
          adarsh<span className="text-faint">.dev</span>
        </span>
      </a>

      {/* `justify-end` would push the overflow off the *start* edge, where it is
          unreachable — no scroll goes negative. An auto start-margin on the first
          link right-aligns the row when it fits and collapses when it does not,
          so every link stays scrollable on a narrow phone. */}
      <div className="flex min-w-0 flex-auto items-center gap-[clamp(10px,1.5vw,22px)] overflow-x-auto [scrollbar-width:none]">
        {NAV_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'true' : undefined}
            className={cn(
              'font-mono text-[11px] tracking-[0.08em] whitespace-nowrap transition-colors first:ml-auto',
              active === id ? 'text-a2' : 'text-muted hover:text-ink',
            )}
          >
            {label}
          </a>
        ))}
      </div>

      <button
        type="button"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
        }}
        className="grid size-8 flex-none place-items-center rounded-full border border-line bg-panel font-mono text-xs text-ink transition-[background-color,border-color,rotate] duration-700 hover:border-line-2 hover:bg-panel-2"
        style={{ rotate: theme === 'dark' ? '0deg' : '360deg' }}
      >
        {theme === 'dark' ? '◐' : '◑'}
      </button>

      <ResumeLink className="flex-none rounded-full bg-linear-to-b from-[#a8bcff] to-a1 px-3.75 py-2.25 font-mono text-[11px] tracking-[0.08em] whitespace-nowrap text-[#07080c] shadow-[0_6px_22px_-8px_rgb(124_156_255/0.9)] transition-[filter] hover:brightness-110">
        résumé ↓
      </ResumeLink>
    </nav>
  )
}
