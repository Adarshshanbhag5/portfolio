import { motion } from 'motion/react'
import { Chip } from '@/components/Chip'
import { SectionHeading } from '@/components/SectionHeading'
import { STACK } from '@/content/stack'
import { dealIn, grid, reveal } from '@/lib/motion'

export function Stack() {
  return (
    <section
      id="stack"
      className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,40px)] pt-[clamp(66px,10vw,120px)]"
    >
      <SectionHeading index="03" label="STACK" title="What I reach for." />

      <motion.div
        {...reveal(grid(0.06))}
        className="mt-[clamp(30px,4.5vw,50px)] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))]"
      >
        {STACK.map(({ title, items }, i) => (
          <motion.div
            key={title}
            variants={dealIn}
            custom={i}
            className="rounded-[18px] border border-line bg-panel p-5 backdrop-blur-[16px]"
          >
            <h3 className="font-mono text-[10.5px] tracking-[0.16em] text-a1">{title}</h3>
            <div className="mt-3.5 flex flex-wrap gap-1.75">
              {items.map(({ label, logo, mono, tone }) => (
                <Chip key={label} logo={logo} mono={mono} tone={tone} size="md">
                  {label}
                </Chip>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
