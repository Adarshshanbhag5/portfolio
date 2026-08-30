import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

const SERVICES = [
  'postgres', 'redis', 'kafka', 'temporal', 'nestjs', 'go', 'docker',
  'k8s', 'lambda', 's3', 'sqs', 'jwt', 'websocket', 'fix',
] as const

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  label: string
}

interface Packet {
  from: number
  to: number
  t: number
  speed: number
}

interface MeshState {
  nodes: Node[]
  packets: Packet[]
}

const nodeCount = (w: number) => (w < 640 ? 8 : w < 1100 ? 11 : SERVICES.length)

/** The drifting service graph behind the whole page. */
export const meshScene = defineScene<MeshState>({
  alwaysRun: true,

  create(w, h) {
    const count = nodeCount(w)
    const nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: rnd(-0.08, 0.08),
      vy: rnd(-0.08, 0.08),
      r: rnd(2.2, 3.8),
      label: SERVICES[i % SERVICES.length],
    }))
    const packets = Array.from({ length: Math.min(8, count) }, (_, i) => ({
      from: i % count,
      to: (i + 3) % count,
      t: Math.random(),
      speed: rnd(0.0016, 0.0044),
    }))
    return { nodes, packets }
  },

  draw({ nodes, packets }, { ctx, w, h, dt, palette }) {
    const step = dt * 60
    const reach = w < 700 ? 190 : 265

    for (const node of nodes) {
      node.x += node.vx * step
      node.y += node.vy * step
      if (node.x < 0 || node.x > w) node.vx *= -1
      if (node.y < 0 || node.y > h) node.vy *= -1
    }

    ctx.lineWidth = 1
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
        if (distance >= reach) continue
        ctx.strokeStyle = inkAlpha(palette, 0.16 * (1 - distance / reach))
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.stroke()
      }
    }

    ctx.font = monoFont(9.5)
    for (const node of nodes) {
      ctx.fillStyle = inkAlpha(palette, 0.5)
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = inkAlpha(palette, 0.28)
      ctx.fillText(node.label, node.x + 9, node.y + 3.5)
    }

    ctx.fillStyle = palette.a2
    ctx.shadowColor = palette.a2
    ctx.shadowBlur = 10
    for (const packet of packets) {
      packet.t += packet.speed * step
      if (packet.t > 1) {
        packet.t = 0
        packet.from = Math.floor(Math.random() * nodes.length)
        packet.to = Math.floor(Math.random() * nodes.length)
      }
      const a = nodes[packet.from]
      const b = nodes[packet.to]
      if (!a || !b) continue
      ctx.beginPath()
      ctx.arc(a.x + (b.x - a.x) * packet.t, a.y + (b.y - a.y) * packet.t, 2.1, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  },
})
