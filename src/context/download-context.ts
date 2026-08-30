import { createContext, use } from 'react'

export interface DownloadValue {
  /**
   * Plays the transfer overlay and resolves the moment it completes, so the
   * caller can open the real file only once the animation has been seen.
   */
  play: () => Promise<void>
}

export const DownloadContext = createContext<DownloadValue | null>(null)

export function useDownloadOverlay() {
  const value = use(DownloadContext)
  if (!value) throw new Error('useDownloadOverlay must be used inside <DownloadProvider>')
  return value
}
