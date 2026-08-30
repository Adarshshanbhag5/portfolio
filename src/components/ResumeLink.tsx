import type { MouseEvent, ReactNode } from 'react'
import { useDownloadOverlay } from '@/context/download-context'
import { PROFILE } from '@/content/site'
import { useBurstOnClick } from '@/hooks/useBurstOnClick'

interface ResumeLinkProps {
  children: ReactNode
  className?: string
}

/**
 * Plays the transfer overlay first, then opens the real PDF. The tab opens
 * around a second after the click, well inside the browser's transient
 * activation window, so it is not treated as an unsolicited popup.
 */
export function ResumeLink({ children, className }: ResumeLinkProps) {
  const { play } = useDownloadOverlay()
  const burst = useBurstOnClick()

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks behave normally: new tab, download, saved bookmark.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    burst(event)
    await play()

    // `noopener` in the feature string forces a null return, which would make
    // the blocked-popup check unusable; sever the link afterwards instead.
    const opened = window.open(PROFILE.resume, '_blank')
    if (opened) opened.opener = null
    else window.location.href = PROFILE.resume
  }

  return (
    <a
      href={PROFILE.resume}
      target="_blank"
      rel="noopener"
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  )
}
