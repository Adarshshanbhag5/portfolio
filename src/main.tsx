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
    {/* Effects sit outermost: the theme wipe and the résumé overlay both
        spend bursts, and neither needs to know about the other. */}
    <EffectsProvider>
      <ThemeProvider>
        <DownloadProvider>
          <DeployProvider>
            <App />
          </DeployProvider>
        </DownloadProvider>
      </ThemeProvider>
    </EffectsProvider>
  </StrictMode>,
)
