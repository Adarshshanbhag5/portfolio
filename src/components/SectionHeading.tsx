import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useScrambleOnHover } from '@/hooks/useScrambleOnHover'
import { drawOut, maskUp, reveal, riseSmall } from '@/lib/motion'

interface SectionHeadingProps {
  index: string
  label: string
  title: string
  /** Sits to the right of the title on wide screens. */
  aside?: ReactNode
}

export function SectionHeading({ index, label, title, aside }: SectionHeadingProps) {
  const titleRef = useScrambleOnHover<HTMLHeadingElement>()

  return (
    <>
      <motion.div {...reveal(riseSmall)} className="flex flex-wrap items-baseline gap-3.5">
        <span className="font-mono text-[11px] tracking-[0.16em] text-a1">
          {index} / {label}
        </span>
        <motion.span
          variants={drawOut}
          className="h-px min-w-10 flex-1 origin-left bg-linear-to-r/srgb from-line to-transparent"
        />
      </motion.div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <motion.h2
          ref={titleRef}
          {...reveal(maskUp)}
          className="mt-4 text-[clamp(30px,4.6vw,60px)] leading-[1.02] font-bold"
        >
          {title}
        </motion.h2>
        {aside}
      </div>
    </>
  )
}
