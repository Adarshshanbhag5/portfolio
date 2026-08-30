import type { ReactNode } from 'react'
import { CountUp } from '@/components/CountUp'
import { Mark } from '@/components/Mark'
import type { ChipProps } from '@/components/Chip'

export interface Role {
  company: string
  title: string
  period: string
  /** Short context labels beside the period. */
  tags: string[]
  points: ReactNode[]
  stack: Pick<ChipProps, 'children' | 'logo' | 'mono'>[]
  current?: boolean
}


export const ROLES: Role[] = [
  {
    company: 'Keenai Global',
    title: 'software engineer, backend',
    period: 'AUG 2025 - PRESENT',
    tags: ['WEALTH MANAGEMENT · FINTECH'],
    current: true,
    points: [
      <>
        Own the backend behind a wealth platform's web and mobile apps: portfolio, market data and
        order placement.
      </>,
      <>
        Built real-time pricing and instrument data across{' '}
        <Mark>
          <CountUp to={18} /> global exchanges
        </Mark>
        .
      </>,
      <>
        Automated options order flow over the <Mark>FIX protocol</Mark> on durable Temporal.io
        workflows.
      </>,
      <>
        Shipped self-serve onboarding end to end. Drop-off down{' '}
        <Mark>
          <CountUp to={95} suffix="%" />
        </Mark>
        .
      </>,
    ],
    stack: [
      { children: 'TypeScript', logo: 'typescript' },
      { children: 'Go', logo: 'go' },
      { children: 'NestJS', logo: 'nestjs' },
      { children: 'Temporal.io', logo: 'temporal', mono: true },
      { children: 'Kafka', logo: 'apachekafka', mono: true },
      { children: 'PostgreSQL', logo: 'postgresql' },
      { children: 'AWS' },
      { children: 'Redis', logo: 'redis' },
      { children: 'MongoDB', logo: 'mongodb' },
      { children: 'EventBridge' },
      { children: 'Amazon SQS' },
      { children: 'EKS', logo: 'kubernetes' },
      { children: 'Docker', logo: 'docker' },
      { children: 'FIX Protocol' },
      { children: 'JWT auth' },
      { children: 'Claude Code', logo: 'claude', mono: true },
    ],
  },
  {
    company: 'Rattle Software',
    title: 'software development engineer',
    period: 'JAN 2024 - AUG 2025',
    tags: ['B2B SAAS'],
    points: [
      <>
        Owned half of a core codebase serving{' '}
        <Mark>
          <CountUp to={50} suffix="K" /> daily users
        </Mark>{' '}
        and $4M ARR.
      </>,
      <>
        Architected a CRM-agnostic sync engine on Temporal.io: sharded workflows, idempotent
        retries, ~3M records per job.
      </>,
      <>
        Built a sandbox-to-production migration tool that lifted retention{' '}
        <Mark>
          <CountUp to={60} suffix="%" />
        </Mark>
        .
      </>,
      <>Cleared every VA/PT finding for SOC 2 across two audit cycles.</>,
    ],
    stack: [
      { children: 'TypeScript', logo: 'typescript' },
      { children: 'Node.js', logo: 'nodedotjs' },
      { children: 'Temporal.io', logo: 'temporal', mono: true },
      { children: 'PostgreSQL', logo: 'postgresql' },
      { children: 'SOC 2' },
      { children: 'Redis', logo: 'redis' },
      { children: 'MongoDB', logo: 'mongodb' },
      { children: 'Salesforce API' },
      { children: 'Slack API' },
      { children: 'Cursor', logo: 'cursor', mono: true },
    ],
  },
]
