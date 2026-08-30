import { motion, useScroll } from 'motion/react'

/** Reading progress across the whole document. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-linear-to-r from-a1 to-a2 shadow-[0_0_12px_rgb(124_156_255/0.8)]"
    />
  )
}
