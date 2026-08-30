import { PROFILE } from '@/content/site'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-[clamp(18px,4vw,40px)] py-7 font-mono text-[10.5px] tracking-[0.14em] text-faint">
        <span className="opacity-80">{PROFILE.fullName.toUpperCase()}</span>
        <span>
          psst, type <span className="text-a2">ship</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="animate-blink size-1.5 rounded-full bg-a2 [--blink-duration:2s]" />
          BUILT WITH REACT · 2026
        </span>
      </div>
    </footer>
  )
}
