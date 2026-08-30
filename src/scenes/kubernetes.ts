import { monoFont } from '@/lib/canvas'
import { rnd } from '@/lib/random'
import { inkAlpha } from '@/lib/theme'
import { defineScene } from '@/scenes/types'

type PodPhase = 'scheduling' | 'creating' | 'running' | 'crashing' | 'terminating'

interface Pod {
  node: number
  slot: number
  phase: PodPhase
  t: number
  generation: number
}

interface ClusterState {
  pods: Pod[]
  elapsed: number
  spawnIn: number
  sinceDeploy: number
  generation: number
  rollingRemaining: number
}

const NODES = 3
const SLOTS = 2
const DESIRED = NODES * SLOTS
const DEPLOY_EVERY = 13
const TAU = Math.PI * 2

const PHASE_DURATION: Record<PodPhase, number> = {
  scheduling: 0.85,
  creating: 0.75,
  running: Infinity,
  crashing: 0.7,
  terminating: 0.5,
}

const NEXT_PHASE: Partial<Record<PodPhase, PodPhase>> = {
  scheduling: 'creating',
  creating: 'running',
  crashing: 'terminating',
}

/** Desired state versus actual: scheduling, crash loops and rolling deploys. */
export const kubernetesScene = defineScene<ClusterState>({
  create: () => ({
    pods: [],
    elapsed: 0,
    spawnIn: 0.2,
    sinceDeploy: 0,
    generation: 1,
    rollingRemaining: 0,
  }),

  draw(s, { ctx, w, h, dt, palette, emit }) {
    const nodeW = (w - 24) / NODES - 8
    const planeX = w / 2
    const planeY = 13
    const slotPosition = (node: number, slot: number): [number, number] => [
      16 + node * (nodeW + 12) + nodeW * (slot === 0 ? 0.3 : 0.7),
      34 + (h - 58) * 0.5,
    ]

    s.elapsed += dt
    s.sinceDeploy += dt
    s.spawnIn -= dt

    if (s.sinceDeploy > DEPLOY_EVERY) {
      s.sinceDeploy = 0
      s.generation += 1
      s.rollingRemaining = DESIRED
    }

    if (s.spawnIn <= 0) {
      s.spawnIn = rnd(0.45, 0.9)
      const taken = new Set(
        s.pods.filter((p) => p.phase !== 'terminating').map((p) => `${p.node}-${p.slot}`),
      )
      let free: [number, number] | null = null
      for (let n = 0; n < NODES && !free; n++) {
        for (let i = 0; i < SLOTS && !free; i++) {
          if (!taken.has(`${n}-${i}`)) free = [n, i]
        }
      }

      if (free) {
        s.pods.push({ node: free[0], slot: free[1], phase: 'scheduling', t: 0, generation: s.generation })
      } else if (s.rollingRemaining > 0) {
        // Cluster is full: retire one pod of the previous generation.
        const stale = s.pods.find((p) => p.phase === 'running' && p.generation < s.generation)
        if (stale) {
          stale.phase = 'terminating'
          stale.t = 0
          s.rollingRemaining -= 1
        } else {
          s.rollingRemaining = 0
        }
      } else if (Math.random() < 0.22) {
        const running = s.pods.filter((p) => p.phase === 'running')
        if (running.length > 3) {
          const victim = running[Math.floor(Math.random() * running.length)]
          victim.phase = 'crashing'
          victim.t = 0
        }
      }
    }

    let ready = 0
    for (let i = s.pods.length - 1; i >= 0; i--) {
      const pod = s.pods[i]
      pod.t += dt
      if (pod.t > PHASE_DURATION[pod.phase]) {
        const next = NEXT_PHASE[pod.phase]
        if (!next) {
          s.pods.splice(i, 1)
          continue
        }
        pod.phase = next
        pod.t = 0
      }
      if (pod.phase === 'running') ready += 1
    }

    ctx.font = monoFont(8.5)
    for (let n = 0; n < NODES; n++) {
      const x = 16 + n * (nodeW + 12)
      ctx.lineWidth = 1
      ctx.strokeStyle = inkAlpha(palette, 0.13)
      ctx.beginPath()
      ctx.roundRect(x, 26, nodeW, h - 34, 9)
      ctx.stroke()

      ctx.fillStyle = inkAlpha(palette, 0.3)
      ctx.fillText(`node-${n + 1}`, x + 3, h - 3)

      ctx.strokeStyle = inkAlpha(palette, 0.1)
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      ctx.moveTo(planeX, planeY + 6)
      ctx.lineTo(x + nodeW / 2, 26)
      ctx.stroke()
      ctx.setLineDash([])

      for (let i = 0; i < SLOTS; i++) {
        const [sx, sy] = slotPosition(n, i)
        ctx.strokeStyle = inkAlpha(palette, 0.1)
        ctx.beginPath()
        ctx.arc(sx, sy, 11, 0, TAU)
        ctx.stroke()
      }
    }

    ctx.fillStyle = palette.a1
    ctx.beginPath()
    ctx.arc(planeX, planeY, 4.5, 0, TAU)
    ctx.fill()
    ctx.fillStyle = inkAlpha(palette, 0.34)
    ctx.fillText('control plane', planeX - 26, planeY - 7)

    for (const pod of s.pods) {
      const [slotX, slotY] = slotPosition(pod.node, pod.slot)
      let x = slotX
      let y = slotY
      let alpha = 1

      if (pod.phase === 'scheduling') {
        // Arc out from the control plane into the slot.
        const e = (() => {
          const t = Math.min(1, pod.t / PHASE_DURATION.scheduling)
          return t * t * (3 - 2 * t)
        })()
        const midX = (planeX + slotX) / 2
        const midY = planeY - 6
        x = (1 - e) ** 2 * planeX + 2 * (1 - e) * e * midX + e * e * slotX
        y = (1 - e) ** 2 * planeY + 2 * (1 - e) * e * midY + e * e * slotY

        ctx.globalAlpha = 0.32
        ctx.lineWidth = 1
        ctx.strokeStyle = palette.a1
        ctx.beginPath()
        ctx.moveTo(planeX, planeY)
        ctx.quadraticCurveTo(midX, midY, x, y)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      if (pod.phase === 'terminating') alpha = Math.max(0, 1 - pod.t / PHASE_DURATION.terminating)
      if (pod.phase === 'crashing') x += Math.sin(pod.t * 46) * 2.4

      const color =
        pod.phase === 'crashing'
          ? palette.down
          : pod.phase === 'creating'
            ? palette.a3
            : pod.phase === 'running'
              ? palette.a2
              : palette.a1

      ctx.globalAlpha =
        alpha * (pod.phase === 'creating' ? 0.6 + Math.sin(s.elapsed * 9) * 0.3 : 1)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x - 6.5, y - 6.5, 13, 13, 3.5)
      ctx.fill()

      if (pod.phase === 'running') {
        ctx.lineWidth = 1
        ctx.strokeStyle = color
        ctx.globalAlpha = alpha * (0.3 + Math.sin(s.elapsed * 2.4 + pod.node + pod.slot) * 0.22)
        ctx.beginPath()
        ctx.arc(x, y, 11, 0, TAU)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    emit(
      'pods',
      `${ready}/${DESIRED}${s.rollingRemaining > 0 ? ` · rollout v${s.generation}` : ' ready'}`,
    )
  },
})
