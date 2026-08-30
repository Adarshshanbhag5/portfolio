export interface MarqueeItem {
  label: string
  logo?: string
  mono?: boolean
}

export const MARQUEE_ROWS: readonly (readonly MarqueeItem[])[] = [
  [
    { label: 'TypeScript', logo: 'typescript' },
    { label: 'Go', logo: 'go' },
    { label: 'Node.js', logo: 'nodedotjs' },
    { label: 'NestJS', logo: 'nestjs' },
    { label: 'PostgreSQL', logo: 'postgresql' },
    { label: 'Redis', logo: 'redis' },
    { label: 'Apache Kafka', logo: 'apachekafka', mono: true },
    { label: 'Temporal.io', logo: 'temporal', mono: true },
    { label: 'Kubernetes', logo: 'kubernetes' },
    { label: 'Docker', logo: 'docker' },
    { label: 'MongoDB', logo: 'mongodb' },
    { label: 'AWS' },
  ],
  [
    { label: 'React', logo: 'react' },
    { label: 'React Native', logo: 'react' },
    { label: 'Next.js', logo: 'nextdotjs', mono: true },
    { label: 'Python', logo: 'python' },
    { label: 'Git', logo: 'git', mono: true },
    { label: 'Amazon SQS' },
    { label: 'EventBridge' },
    { label: 'FIX Protocol' },
    { label: 'WebSockets' },
    { label: 'Claude Code', logo: 'claude', mono: true },
    { label: 'Cursor', logo: 'cursor', mono: true },
    { label: 'Zustand' },
  ],
] as const
