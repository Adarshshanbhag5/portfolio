export const SECTIONS = [
  { id: 'top', label: 'top', index: '00' },
  { id: 'work', label: 'work', index: '01' },
  { id: 'systems', label: 'systems', index: '02' },
  { id: 'stack', label: 'stack', index: '03' },
  { id: 'builds', label: 'builds', index: '04' },
  { id: 'contact', label: 'contact', index: '05' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

/** Everything but `top`, which is reachable from the wordmark. */
export const NAV_SECTIONS = SECTIONS.filter((section) => section.id !== 'top')

export const SECTION_IDS = SECTIONS.map((section) => section.id)

export const PROFILE = {
  name: 'Adarsh Shanbhag',
  fullName: 'Adarsh Ravindra Shanbhag',
  role: 'Backend Engineer',
  base: 'Bengaluru, India',
  email: 'adarshshanbhag5@gmail.com',
  phone: { label: '+91 70197 12764', href: 'tel:+917019712764' },
  linkedin: { label: 'adarsh-shanbhag', href: 'https://linkedin.com/in/adarsh-shanbhag' },
  github: { label: 'Adarshshanbhag5', href: 'https://github.com/Adarshshanbhag5' },
  // BASE_URL, not a root-absolute path: GitHub Pages serves this repo from a
  // sub-path, where `/adarsh-shanbhag-resume.pdf` would 404.
  resume: `${import.meta.env.BASE_URL}adarsh-shanbhag-resume.pdf`,
} as const

export const BOOT_LOG = [
  ['postgres · pool ready', 'ok'],
  ['redis · cache warm', 'ok'],
  ['kafka · 3 brokers, 12 partitions', 'ok'],
  ['temporal · 8 workers online', 'ok'],
  ['fix session · logon accepted', 'ok'],
  ['http · listening :8080', 'ok'],
] as const
