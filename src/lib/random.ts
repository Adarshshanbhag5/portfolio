/** Uniform float in [min, max). */
export const rnd = (min: number, max: number) => min + Math.random() * (max - min)

/** Random element of a non-empty array. */
export const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]
