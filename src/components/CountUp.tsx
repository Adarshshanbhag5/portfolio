import { animate, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'

const DURATION = 0.85

interface CountUpProps {
  to: number
  suffix?: string
}

/**
 * Counts up once the number scrolls into view. The value lives in a motion
 * value, so the ~66 intermediate frames never touch React's render path.
 */
export function CountUp({ to, suffix = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reducedMotion = useReducedMotion()
  const count = useMotionValue(reducedMotion ? to : 0)
  const label = useTransform(count, (value) => `${Math.round(value)}${suffix}`)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const controls = animate(count, to, { duration: DURATION, ease: [0, 0, 0.2, 1] })
    return () => controls.stop()
  }, [count, inView, reducedMotion, to])

  return <motion.span ref={ref}>{label}</motion.span>
}
