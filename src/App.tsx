import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

export default function App() {
  return (
    <main className={cn('grid min-h-dvh place-items-center')}>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-sm tracking-[0.3em] text-ink/50 uppercase"
      >
        Clean slate
      </motion.p>
    </main>
  )
}
