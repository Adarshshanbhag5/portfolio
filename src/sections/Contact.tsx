import { m } from 'motion/react'
import { ResumeLink } from '@/components/ResumeLink'
import { PROFILE } from '@/content/site'
import { useBurstOnClick } from '@/hooks/useBurstOnClick'
import { useScrambleOnHover } from '@/hooks/useScrambleOnHover'
import { blurIn, reveal } from '@/lib/motion'

const PILL =
  'rounded-full px-5.5 py-3.5 font-mono text-[12.5px] tracking-[0.04em] transition-[filter,transform,background-color,border-color]'

const DETAILS = [
  { label: 'PHONE', value: PROFILE.phone.label, href: PROFILE.phone.href },
  { label: 'LINKEDIN', value: `${PROFILE.linkedin.label} ↗`, href: PROFILE.linkedin.href, external: true },
  { label: 'GITHUB', value: `${PROFILE.github.label} ↗`, href: PROFILE.github.href, external: true },
  { label: 'BASE', value: PROFILE.base },
]

export function Contact() {
  const titleRef = useScrambleOnHover<HTMLHeadingElement>()
  const burst = useBurstOnClick()

  return (
    <section
      id="contact"
      className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,40px)] pt-[clamp(76px,11vw,140px)] pb-[clamp(56px,8vw,96px)]"
    >
      <m.div
        {...reveal(blurIn)}
        className="relative overflow-hidden rounded-[26px] border border-line bg-[linear-gradient(160deg,color-mix(in_srgb,var(--pf-a1)_14%,transparent),color-mix(in_srgb,var(--pf-a2)_7%,transparent)_55%,transparent)] p-[clamp(28px,5vw,56px)] backdrop-blur-[20px]"
      >
        <div className="animate-drift-b pointer-events-none absolute -top-[40%] -right-[10%] h-[180%] w-[46%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--pf-a1)_30%,transparent),transparent_70%)] blur-[40px]" />

        <div className="relative">
          <span className="font-mono text-[11px] tracking-[0.16em] text-a2">05 / CONTACT</span>
          <h2
            ref={titleRef}
            className="mt-4 text-[clamp(32px,6vw,76px)] leading-[0.98] font-bold tracking-[-0.045em]"
          >
            Let's talk.
          </h2>
          <p className="mt-4 max-w-[40ch] text-[clamp(15px,1.5vw,18px)] leading-[1.6] text-muted">
            Hiring for backend, or need someone to own a service end to end? Email is fastest.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              onClick={burst}
              data-selectable
              className={`${PILL} bg-linear-to-b from-[#b7f5e6] to-a2 text-[#07080c] shadow-[0_12px_34px_-12px_rgb(75_227_193/0.85)] hover:-translate-y-px hover:brightness-108`}
            >
              {PROFILE.email}
            </a>
            <ResumeLink
              className={`${PILL} border border-line-2 bg-panel text-ink hover:bg-panel-2`}
            >
              résumé ↓
            </ResumeLink>
          </div>

          <dl
            data-selectable
            className="mt-8.5 grid gap-3.5 border-t border-line pt-6.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
            {DETAILS.map(({ label, value, href, external }) => (
              <div key={label}>
                <dt className="font-mono text-[10px] tracking-[0.16em] text-faint">{label}</dt>
                <dd className="mt-1.25 text-[15px]">
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
                      className="text-ink transition-colors hover:text-a2"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </m.div>
    </section>
  )
}
