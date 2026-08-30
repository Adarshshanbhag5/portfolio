import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { BackgroundField } from '@/components/BackgroundField'
import { BootSequence } from '@/components/BootSequence'
import { DotRail } from '@/components/DotRail'
import { Footer } from '@/components/Footer'
import { LiveTape } from '@/components/LiveTape'
import { Marquee } from '@/components/Marquee'
import { Nav } from '@/components/Nav'
import { PointerRing } from '@/components/PointerRing'
import { ScrollProgress } from '@/components/ScrollProgress'
import { SECTION_IDS } from '@/content/site'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useEasterEggs } from '@/hooks/useEasterEggs'
import { useKeySequence } from '@/hooks/useKeySequence'
import { Builds } from '@/sections/Builds'
import { Contact } from '@/sections/Contact'
import { Hero } from '@/sections/Hero'
import { Stack } from '@/sections/Stack'
import { Systems } from '@/sections/Systems'
import { Work } from '@/sections/Work'

export default function App() {
  const reducedMotion = useReducedMotion()
  const [bootDone, setBootDone] = useState(false)
  // Visitors who asked for less motion never see the cold start, so the hero
  // opens immediately for them.
  const introComplete = bootDone || reducedMotion === true
  const active = useActiveSection(SECTION_IDS)
  const { deploy, chaos } = useEasterEggs()

  useKeySequence({ ship: deploy, kafka: chaos })


  return (
    <>
      <a
        href="#work"
        className="sr-only rounded-full bg-a2 px-4 py-2 font-mono text-xs text-[#07080c] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
      >
        Skip to content
      </a>

      {!reducedMotion && <BootSequence onDone={() => setBootDone(true)} />}

      <BackgroundField />
      <ScrollProgress />
      <PointerRing />
      <Nav active={active} />
      <DotRail active={active} />

      <div className="relative z-1">
        <main>
          <Hero introComplete={introComplete} />
          <LiveTape />
          <Marquee />
          <Work />
          <Systems />
          <Stack />
          <Builds />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
