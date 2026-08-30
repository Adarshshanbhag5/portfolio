import { useCanvasScene } from '@/hooks/useCanvasScene'
import { eventLoopScene } from '@/scenes/eventLoop'
import { meshScene } from '@/scenes/mesh'

/** Accent glow. Mixed from the theme's own accents rather than fixed rgba. */
const glow = (accent: string, strength: number) =>
  `radial-gradient(circle, color-mix(in srgb, var(--pf-${accent}) ${strength}%, transparent), transparent 68%)`

export function BackgroundField() {
  const meshRef = useCanvasScene(meshScene)
  const eventLoopRef = useCanvasScene(eventLoopScene)

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="animate-drift-a absolute -top-[18%] -left-[12%] size-[62vw] rounded-full blur-[52px]"
        style={{ background: glow('a1', 30) }}
      />
      <div
        className="animate-drift-b absolute -right-[14%] -bottom-[24%] size-[58vw] rounded-full blur-[58px]"
        style={{ background: glow('a2', 20) }}
      />
      <div
        className="animate-drift-c absolute top-[34%] left-[46%] size-[40vw] rounded-full blur-[64px]"
        style={{ background: glow('a3', 12) }}
      />

      <canvas ref={meshRef} className="absolute inset-0 size-full opacity-72" />
      <canvas ref={eventLoopRef} className="absolute inset-0 size-full opacity-62" />

      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in srgb, var(--pf-txt) 5.5%, transparent) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'var(--pf-vignette)' }} />
    </div>
  )
}
