import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { DeployProvider } from '@/context/deploy'
import { DownloadProvider } from '@/context/download'
import { EffectsProvider } from '@/context/effects'
import { ThemeProvider } from '@/context/theme'
import '@/styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    {/* Motion does not consult `prefers-reduced-motion` on its own. Under
        `user` it drops transform animations for anyone who asked for less
        motion, while opacity fades still play. */}
    <MotionConfig reducedMotion="user">
      {/* Only the DOM animation feature set is loaded: the project uses no
          layout projection and no drag. `strict` turns a stray `motion.*` into
          an error rather than silently pulling the full bundle back in. */}
      <LazyMotion features={domAnimation} strict>
        {/* Effects sit outermost: the theme cutover, the rollout console and
            the résumé overlay all spend bursts, and none needs the others. */}
        <EffectsProvider>
          <ThemeProvider>
            <DownloadProvider>
              <DeployProvider>
                <App />
              </DeployProvider>
            </DownloadProvider>
          </ThemeProvider>
        </EffectsProvider>
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
)
