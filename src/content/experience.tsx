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
        Own Wealth-Core, the service behind the client web and mobile apps for HNI and UHNI
        investors: portfolio, holdings, market data and order placement across{' '}
        <Mark>
          <CountUp to={6} /> asset classes
        </Mark>
        , from API design through production support.
      </>,
      <>
        Built the instrument universe and real-time pricing across{' '}
        <Mark>
          <CountUp to={18} /> global exchanges
        </Mark>{' '}
        in the US, Europe and Singapore, reconciling every venue's symbology and trading calendar
        from LSEG into one internal contract.
      </>,
      <>
        Market-data ingestion runs on <Mark>Temporal.io</Mark>: scheduled fan-out workflows keep
        option chains, equity fundamentals and company financials current, and durable retries
        absorb vendor outages instead of leaving holes in the data.
      </>,
      <>
        Own the order management service for US equity options, routing to BNY Pershing over the{' '}
        <Mark>FIX protocol</Mark> and orchestrating the full order lifecycle as workflows. It
        replaced manual entry at the dealer desk.
      </>,
      <>
        Shipped self-serve KYC onboarding end to end, the platform's highest-throughput flow, with
        Singpass identity checks and DocuSign signatures. Drop-off fell{' '}
        <Mark>
          <CountUp to={95} suffix="%" />
        </Mark>{' '}
        and opening an account went from 15 days to 2.
      </>,
      <>
        Keep the async stack running: Kafka on AWS MSK for product analytics, EventBridge and SQS
        consumers for portfolio sync, and an in-house JWT session service that replaced Lambda and
        Cognito along with their cold starts.
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
        Owned half of a core product codebase serving{' '}
        <Mark>
          <CountUp to={50} suffix="K" /> daily users
        </Mark>{' '}
        and $4M in annual recurring revenue, cutting churn <Mark>90%</Mark> through feature
        delivery, critical bug work and sitting directly with the customer-facing teams.
      </>,
      <>
        Architected No-Flow, a CRM-agnostic rules engine on <Mark>Temporal.io</Mark> that syncs
        incrementally every five minutes and removes any dependency on native CRM automation.
      </>,
      <>
        Scaled it with sharded workflows, idempotent retries and tuned PostgreSQL bulk upserts to
        roughly{' '}
        <Mark>
          <CountUp to={3} suffix="M" /> records per job
        </Mark>
        .
      </>,
      <>
        Built sandbox-to-production migration so customers could validate configuration and promote
        it in a single step, replacing an error-prone manual process and lifting retention{' '}
        <Mark>
          <CountUp to={60} suffix="%" />
        </Mark>
        .
      </>,
      <>
        Owned Meeting-DM: Slack notifications enriched with Salesforce context around scheduled
        meetings, driven by Temporal cron workflows polling Google Calendar, so reps could log calls
        without leaving Slack.
      </>,
      <>
        Cleared every VA/PT finding for the annual <Mark>SOC 2</Mark> audit across two consecutive
        cycles.
      </>,
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
