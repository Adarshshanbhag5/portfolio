import type { Transition, Variants } from 'motion/react'

/** The design's single easing curve. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const ENTER: Transition = { duration: 0.55, ease: EASE_OUT_EXPO }

/**
 * The design drove reveals with `animation-timeline: view()`, which only
 * Chromium ships. These variants reproduce them through Motion's
 * `whileInView` so Safari and Firefox get the same page.
 */
export const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: ENTER },
}

export const riseSmall: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: ENTER },
}

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(14px)', y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
}

export const VIEWPORT = { once: true, amount: 0.25 } as const

/** Headings rise out from behind their own baseline. */
export const maskUp: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', y: 14 },
  visible: {
    clipPath: 'inset(0 0 -12% 0)',
    y: 0,
    transition: { duration: 0.62, ease: EASE_OUT_EXPO },
  },
}

/** Rules draw themselves out from the kicker. */
export const drawOut: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
}

/**
 * Cards are dealt in from the edge nearest their column, with a touch of
 * rotation so the set does not arrive as one flat block. Pass the card's index
 * as `custom`; the cycle reads as a weave across a three-column grid.
 */
export const EDGE = { left: 0, below: 1, right: 2 } as const

const EDGES = [
  { x: -70, y: 14, rotate: -1.6 },
  { x: 0, y: 58, rotate: 0 },
  { x: 70, y: 14, rotate: 1.6 },
] as const

export const dealIn: Variants = {
  hidden: (edge: number = 0) => ({ opacity: 0, scale: 0.96, ...EDGES[edge % EDGES.length] }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.62, ease: EASE_OUT_EXPO },
  },
}

/**
 * Reveals a grid in reading order. Children carry `rise` and inherit the
 * container's variant label, so they need no viewport props of their own.
 */
export const grid = (step = 0.07): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step } },
})

/**
 * Shared reveal props. Spread onto any `motion.*` element rather than wrapping
 * it, because the reveals belong on the real elements, not on extra divs.
 */
export const reveal = (variants: Variants = rise) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: VIEWPORT,
  variants,
}) as const

/**
 * Hero variants. The delay arrives through Motion's `custom` prop so the whole
 * opening can be sequenced from one parent flipping to `visible`.
 */
export const heroRise: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { ...ENTER, delay } }),
}

export const heroFade: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({ opacity: 1, transition: { duration: 0.5, delay } }),
}

export const heroBlur: Variants = {
  hidden: { opacity: 0, filter: 'blur(14px)', y: 20, scale: 0.98 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay },
  }),
}
