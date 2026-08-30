import type { ChipTone } from '@/components/Chip'

export interface StackItem {
  label: string
  logo?: string
  mono?: boolean
  tone?: ChipTone
}

export interface StackGroup {
  title: string
  items: StackItem[]
}

export const STACK: StackGroup[] = [
  {
    title: 'LANGUAGES',
    items: [
      { label: 'TypeScript', logo: 'typescript', tone: 'a1' },
      { label: 'Go', logo: 'go', tone: 'a1' },
      { label: 'Python', logo: 'python' },
      { label: 'Java' },
      { label: 'C/C++' },
      { label: 'SQL' },
    ],
  },
  {
    title: 'BACKEND',
    items: [
      { label: 'Node.js', logo: 'nodedotjs' },
      { label: 'NestJS', logo: 'nestjs' },
      { label: 'REST' },
      { label: 'WebSockets' },
      { label: 'Microservices' },
      { label: 'System design' },
    ],
  },
  {
    title: 'DISTRIBUTED & FINTECH',
    items: [
      { label: 'Temporal.io', logo: 'temporal', mono: true, tone: 'a2' },
      { label: 'Kafka', logo: 'apachekafka', mono: true },
      { label: 'FIX protocol', tone: 'a2' },
      { label: 'SQS · EventBridge' },
      { label: 'Market data (LTP)' },
      { label: 'Idempotency' },
    ],
  },
  {
    title: 'DATA & CLOUD',
    items: [
      { label: 'PostgreSQL', logo: 'postgresql', tone: 'a2' },
      { label: 'Redis', logo: 'redis' },
      { label: 'MongoDB', logo: 'mongodb' },
      { label: 'AWS · EKS' },
      { label: 'Docker', logo: 'docker' },
      { label: 'Kubernetes', logo: 'kubernetes' },
    ],
  },
  {
    title: 'AI & TOOLING',
    items: [
      { label: 'Claude Code', logo: 'claude', mono: true, tone: 'a3' },
      { label: 'Cursor', logo: 'cursor', mono: true, tone: 'a3' },
      { label: 'LLM APIs' },
      { label: 'Agentic workflows' },
      { label: 'Postman' },
      { label: 'Zed' },
      { label: 'Git', logo: 'git', mono: true },
    ],
  },
  {
    title: 'FRONTEND',
    items: [
      { label: 'React.js', logo: 'react', tone: 'a3' },
      { label: 'React Native', logo: 'react', tone: 'a3' },
      { label: 'Next.js' },
      { label: 'Redux' },
      { label: 'Zustand' },
    ],
  },
]
