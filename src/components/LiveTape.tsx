import { useCanvasScene } from '@/hooks/useCanvasScene'
import { tapeScene } from '@/scenes/tape'

/** Last-traded-price strip that runs under the hero. */
export function LiveTape() {
  const canvasRef = useCanvasScene(tapeScene)

  return (
    <div className="relative mt-[clamp(44px,6vw,76px)] border-y border-line bg-[color-mix(in_srgb,var(--pf-bg2)_42%,transparent)] backdrop-blur-[10px]">
      <div className="absolute inset-y-0 left-0 z-2 flex items-center gap-2.5 bg-linear-to-r/srgb from-bg from-60% to-transparent px-[clamp(12px,3vw,20px)]">
        <span className="animate-blink size-1.5 rounded-full bg-up shadow-[0_0_8px_var(--pf-up)] [--blink-duration:1.2s]" />
        <span className="font-mono text-[9.5px] tracking-[0.16em] whitespace-nowrap text-faint">
          LTP FEED
        </span>
      </div>
      <canvas aria-hidden ref={canvasRef} className="block h-11 w-full" />
    </div>
  )
}
