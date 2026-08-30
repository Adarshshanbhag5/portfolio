import type { MouseEvent, ReactNode } from 'react'
import { useDownloadOverlay } from '@/context/download-context'
import { PROFILE } from '@/content/site'
import { useBurstOnClick } from '@/hooks/useBurstOnClick'

interface ResumeLinkProps {
  children: ReactNode
  className?: string
}

/** Opens the PDF for real, and plays the transfer overlay over the page. */
export function ResumeLink({ children, className }: ResumeLinkProps) {
  const { play } = useDownloadOverlay()
  const burst = useBurstOnClick()

  const onClick = (event: MouseEvent) => {
    burst(event)
    play()
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
