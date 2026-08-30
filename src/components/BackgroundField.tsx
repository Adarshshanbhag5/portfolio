import { m, useScroll, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { useCanvasScene } from '@/hooks/useCanvasScene'
import { eventLoopScene } from '@/scenes/eventLoop'
import { meshScene } from '@/scenes/mesh'

/** Accent glow. Mixed from the theme's own accents rather than fixed rgba. */
const glow = (accent: string, strength: number) =>
  `radial-gradient(circle, color-mix(in srgb, var(--pf-${accent}) ${strength}%, transparent), transparent 68%)`

/**
 * Wrapper that carries the parallax offset, so the layer underneath keeps its
 * own CSS drift animation. Motion and a keyframe cannot share one `transform`.
 */
function Parallax({ y, children }: { y: MotionValue<number>; children: ReactNode }) {
  return (
    <m.div style={{ y }} className="absolute inset-0">
      {children}
    </m.div>
  )
}

export function BackgroundField() {
  const meshRef = useCanvasScene(meshScene)
  const eventLoopRef = useCanvasScene(eventLoopScene)

  // Depth cue: the layers travel at different rates as the page scrolls.
  const { scrollYProgress } = useScroll()
  const nearY = useTransform(scrollYProgress, [0, 1], [0, 220])
  const midY = useTransform(scrollYProgress, [0, 1], [0, -260])
  const farY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 90])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Parallax y={nearY}>
        <div
          className="animate-drift-a absolute -top-[18%] -left-[12%] size-[62vw] rounded-full blur-[52px]"
          style={{ background: glow('a1', 30) }}
        />
      </Parallax>
      <Parallax y={midY}>
        <div
          className="animate-drift-b absolute -right-[14%] -bottom-[24%] size-[58vw] rounded-full blur-[58px]"
          style={{ background: glow('a2', 20) }}
        />
      </Parallax>
      <Parallax y={farY}>
        <div
          className="animate-drift-c absolute top-[34%] left-[46%] size-[40vw] rounded-full blur-[64px]"
          style={{ background: glow('a3', 12) }}
        />
      </Parallax>

      <canvas ref={meshRef} className="absolute inset-0 size-full opacity-72" />
      <canvas ref={eventLoopRef} className="absolute inset-0 size-full opacity-62" />

      <m.div
        style={{
          y: gridY,
          backgroundImage:
            'radial-gradient(color-mix(in srgb, var(--pf-txt) 5.5%, transparent) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
        className="absolute -inset-y-24 inset-x-0 opacity-50"
      />
      <div className="absolute inset-0" style={{ background: 'var(--pf-vignette)' }} />
    </div>
  )
}
