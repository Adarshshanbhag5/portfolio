import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { useScrambleOnHover } from '@/hooks/useScrambleOnHover'
import { drawOut, maskUp, passthrough, reveal, riseSmall } from '@/lib/motion'

interface SectionHeadingProps {
  index: string
  label: string
  title: string
  /** Sits to the right of the title on wide screens. */
  aside?: ReactNode
}

export function SectionHeading({ index, label, title, aside }: SectionHeadingProps) {
  const titleRef = useScrambleOnHover<HTMLSpanElement>()

  return (
    <>
      <m.div {...reveal(riseSmall)} className="flex flex-wrap items-baseline gap-3.5">
        <span className="font-mono text-[11px] tracking-[0.16em] text-a1">
          {index} / {label}
        </span>
        <m.span
          variants={drawOut}
          className="h-px min-w-10 flex-1 origin-left bg-linear-to-r/srgb from-line to-transparent"
        />
      </m.div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <m.h2
          {...reveal(passthrough)}
          // The heading itself is never clipped, so the observer behind
          // `whileInView` always sees it; the padding gives descenders room
          // inside the mask and the negative margin keeps the layout unchanged.
          className="mt-4 -mb-[0.14em] overflow-hidden pb-[0.14em] text-[clamp(30px,4.6vw,60px)] leading-[1.02] font-bold"
        >
          <m.span ref={titleRef} variants={maskUp} className="block">
            {title}
          </m.span>
        </m.h2>
        {aside}
      </div>
    </>
  )
}
