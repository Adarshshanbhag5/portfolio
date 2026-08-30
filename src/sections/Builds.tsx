import { motion } from 'motion/react'
import { BrandIcon } from '@/components/BrandIcon'
import { Chip } from '@/components/Chip'
import { SectionHeading } from '@/components/SectionHeading'
import { BUILDS } from '@/content/builds'
import { useBurstOnClick } from '@/hooks/useBurstOnClick'
import { EDGE, dealIn, grid, reveal } from '@/lib/motion'

export function Builds() {
  const burst = useBurstOnClick()

  return (
    <section
      id="builds"
      className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,40px)] pt-[clamp(66px,10vw,120px)]"
    >
      <SectionHeading index="04" label="BUILDS" title="Shipped on my own time." />

      <motion.div
        {...reveal(grid(0.1))}
        className="mt-[clamp(30px,4.5vw,50px)] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]"
      >
        {BUILDS.map(({ name, kicker, summary, stack, href }, i) => (
          <motion.a
            key={name}
            href={href}
            target="_blank"
            rel="noopener"
            onClick={burst}
            variants={dealIn}
            custom={i === 0 ? EDGE.left : EDGE.right}
            className="block rounded-[20px] border border-line bg-linear-to-b from-[color-mix(in_srgb,var(--pf-txt)_5%,transparent)] to-[color-mix(in_srgb,var(--pf-txt)_1.5%,transparent)] px-5.5 py-6 text-ink backdrop-blur-[18px] transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-line-2"
          >
            <div className="flex items-center gap-2.25">
              <BrandIcon slug="react" className="h-4" />
              <span className="font-mono text-[10.5px] tracking-[0.14em] text-a1">{kicker}</span>
              <span className="ml-auto font-mono text-sm text-faint">↗</span>
            </div>

            <h3 className="mt-4 text-[clamp(20px,2.2vw,27px)] leading-[1.15] font-semibold tracking-[-0.03em]">
              {name}
            </h3>
            <p className="mt-2.5 text-[14.5px] leading-[1.6] text-muted">{summary}</p>

            <div className="mt-4.5 flex flex-wrap gap-1.75">
              {stack.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  )
}
