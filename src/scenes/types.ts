import type { Palette, ThemeName } from '@/lib/theme'

/** Publishes a scene's live number to a DOM node outside the canvas. */
export type SceneEmit = (key: string, text: string, color?: string) => void

export interface SceneFrame {
  ctx: CanvasRenderingContext2D
  /** CSS pixels. */
  w: number
  h: number
  /** Seconds since the previous frame. */
  dt: number
  palette: Palette
  theme: ThemeName
  emit: SceneEmit
}

export interface Scene<State> {
  /** Build fresh state. Re-run whenever the canvas is resized. */
  create: (w: number, h: number) => State
  draw: (state: State, frame: SceneFrame) => void
  /**
   * Keep drawing while off-screen. Only the full-viewport background scenes
   * need this; everything else pauses when scrolled away.
   */
  alwaysRun?: boolean
}

/** Keeps each scene module's state type inferred without an explicit generic. */
export const defineScene = <State,>(scene: Scene<State>) => scene
