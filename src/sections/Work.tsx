import { m, useScroll } from 'motion/react'
import { useRef } from 'react'
import { Chip } from '@/components/Chip'
import { SectionHeading } from '@/components/SectionHeading'
import { ROLES } from '@/content/experience'
import type { Role } from '@/content/experience'
import { EDGE, dealIn, grid, reveal } from '@/lib/motion'
import { cn } from '@/lib/cn'

function RoleCard({ role }: { role: Role }) {
  return (
    <m.article
      variants={dealIn}
      custom={EDGE.left}
      className="relative pl-[clamp(30px,4vw,46px)]"
    >
      <span className="absolute top-6.5 left-0 size-4 rounded-full border-2 border-a1 bg-bg shadow-[0_0_16px_rgb(124_156_255/0.7)]">
        <span className="animate-pulse-dot absolute inset-[3px] rounded-full bg-a1" />
      </span>

      <div className="relative overflow-hidden rounded-[20px] border border-line bg-linear-to-b/srgb from-[color-mix(in_srgb,var(--pf-txt)_5.5%,transparent)] to-[color-mix(in_srgb,var(--pf-txt)_2%,transparent)] p-[clamp(20px,3vw,30px)] backdrop-blur-[18px] transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-line-2">
        <div className="animate-beam absolute top-0 left-0 h-px w-[34%] bg-linear-to-r/srgb from-transparent via-a1 to-transparent" />

        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2.5">
          <span className="font-mono text-[11px] tracking-[0.12em] text-a2">{role.period}</span>
          {role.current && (
            <span className="rounded-full border border-[color-mix(in_srgb,var(--pf-a2)_35%,transparent)] bg-[color-mix(in_srgb,var(--pf-a2)_10%,transparent)] px-2.5 py-0.75 font-mono text-[10px] tracking-[0.12em] text-a2">
              CURRENT
            </span>
          )}
          {role.tags.map((tag) => (
            <span key={tag} className="font-mono text-[10px] tracking-[0.12em] text-faint">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mt-3 text-[clamp(24px,3vw,36px)] leading-[1.05] font-bold">{role.company}</h3>
        <p className="mt-1.25 font-mono text-xs text-muted">{role.title}</p>

        <ul className="mt-5 flex flex-col gap-3">
          {role.points.map((point, i) => (
            <li
              key={i}
              className="grid grid-cols-[18px_1fr] gap-3 text-[15.5px] leading-[1.55] text-muted"
            >
              <span className="pt-1 font-mono text-[11px] text-a1">→</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2">
          {role.stack.map((item) => (
            <Chip key={String(item.children)} logo={item.logo} mono={item.mono}>
              {item.children}
            </Chip>
          ))}
        </div>
      </div>
    </m.article>
  )
}

export function Work() {
  const timelineRef = useRef<HTMLDivElement>(null)
  // Fills as the timeline passes the reading line, the same anchor the design used.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 72%', 'end 72%'],
  })

  return (
    <section
      id="work"
      className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,40px)] pt-[clamp(66px,10vw,120px)]"
    >
      <SectionHeading index="01" label="WORK" title="Where I've built." />

      <m.div
        ref={timelineRef}
        {...reveal(grid(0.12))}
        className="relative mt-[clamp(34px,5vw,56px)] flex flex-col gap-5"
      >
        <div className="absolute top-2.5 bottom-2.5 left-[7px] w-0.5 rounded-full bg-line">
          <m.div
            style={{ scaleY: scrollYProgress }}
            className={cn(
              'h-full w-full origin-top rounded-full',
              'bg-linear-to-b/srgb from-a1 to-a2 shadow-[0_0_14px_rgb(124_156_255/0.6)]',
            )}
          />
        </div>

        {ROLES.map((role) => (
          <RoleCard key={role.company} role={role} />
        ))}
      </m.div>
    </section>
  )
}
