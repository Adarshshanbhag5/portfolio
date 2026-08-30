import { createContext, use } from 'react'

export interface DownloadValue {
  /** Plays the transfer overlay. The real download is left to the browser. */
  play: () => void
}

export const DownloadContext = createContext<DownloadValue | null>(null)

export function useDownloadOverlay() {
  const value = use(DownloadContext)
  if (!value) throw new Error('useDownloadOverlay must be used inside <DownloadProvider>')
  return value
}
