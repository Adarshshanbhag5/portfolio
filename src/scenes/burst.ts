import { pick, rnd } from '@/lib/random'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  square: boolean
  life: number
  maxLife: number
}

const GRAVITY = 0.16

/**
 * Confetti field for the celebratory bursts. Owns its own particle list so the
 * provider only has to hand it a surface each frame.
 */
export function createBurstField() {
  const particles: Particle[] = []

  return {
    get size() {
      return particles.length
    },

    spawn(x: number, y: number, count: number, spread: number, colors: readonly string[]) {
      for (let i = 0; i < count; i++) {
        const angle = rnd(0, Math.PI * 2)
        const speed = rnd(1.4, spread)
        const maxLife = 92
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - rnd(1, 4),
          r: rnd(1.6, 3.6),
          color: pick(colors),
          square: Math.random() < 0.4,
          life: rnd(46, maxLife),
          maxLife,
        })
      }
    },

    draw(ctx: CanvasRenderingContext2D, h: number) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vy += GRAVITY
        p.x += p.vx
        p.y += p.vy
        p.life -= 1

        if (p.life <= 0 || p.y > h + 40) {
          particles.splice(i, 1)
          continue
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife))
        ctx.fillStyle = p.color
        if (p.square) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.life * 0.12)
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2)
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    },
  }
}
