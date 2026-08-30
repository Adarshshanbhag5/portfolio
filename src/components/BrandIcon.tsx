import { useState } from 'react'
import { useTheme } from '@/context/theme-context'
import { cn } from '@/lib/cn'
import type { ThemeName } from '@/lib/theme'

/** Brands whose own colour disappears against the ground get the ink colour. */
const MONO_HEX: Record<ThemeName, string> = { dark: 'e9ecf5', light: '13151c' }

interface BrandIconProps {
  /** Simple Icons slug, e.g. `postgresql`. */
  slug: string
  /** Request the icon in the theme's ink colour instead of the brand's. */
  mono?: boolean
  className?: string
}

export function BrandIcon({ slug, mono, className }: BrandIconProps) {
  const { theme } = useTheme()
  const [unavailable, setUnavailable] = useState(false)

  // The CDN does not carry every brand; drop the icon rather than show a gap.
  if (unavailable) return null

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}${mono ? `/${MONO_HEX[theme]}` : ''}`}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setUnavailable(true)}
      className={cn('w-auto shrink-0', className)}
    />
  )
}
