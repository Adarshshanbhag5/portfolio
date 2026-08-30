import { PROFILE } from '@/content/site'

export interface Build {
  name: string
  kicker: string
  summary: string
  stack: string[]
  href: string
}

export const BUILDS: Build[] = [
  {
    name: 'react-native-palette-picker',
    kicker: 'NPM · 200+ PROJECTS',
    summary:
      "Exposes Android's Color Palette API to React Native so apps can theme themselves from artwork at runtime.",
    stack: ['React Native', 'Java', 'Android'],
    href: PROFILE.github.href,
  },
  {
    name: 'MusicFumes',
    kicker: 'ANDROID · OFFLINE',
    summary:
      'An offline music player for large local media libraries, with custom Java native modules for file access and playback.',
    stack: ['React Native', 'TypeScript', 'Zustand'],
    href: PROFILE.github.href,
  },
]
