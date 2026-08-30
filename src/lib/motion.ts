import type { Transition, Variants } from 'motion/react'

/** The design's single easing curve. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const ENTER: Transition = { duration: 1, ease: EASE_OUT_EXPO }

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
    transition: { duration: 1.2, ease: EASE_OUT_EXPO },
  },
}

export const VIEWPORT = { once: true, amount: 0.15 } as const

/**
 * Shared reveal props. Spread onto any `motion.*` element rather than wrapping
 * it — the design's reveals are on the real elements, not on extra divs.
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
  visible: (delay: number = 0) => ({ opacity: 1, transition: { duration: 1, delay } }),
}

export const heroBlur: Variants = {
  hidden: { opacity: 0, filter: 'blur(14px)', y: 20, scale: 0.98 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    scale: 1,
    transition: { duration: 1.2, ease: EASE_OUT_EXPO, delay },
  }),
}
