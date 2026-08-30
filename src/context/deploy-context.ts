import { createContext, use } from 'react'

export interface DeployValue {
  /** Runs the rollout console. No-op while one is already in flight. */
  run: () => void
}

export const DeployContext = createContext<DeployValue | null>(null)

export function useDeploy() {
  const value = use(DeployContext)
  if (!value) throw new Error('useDeploy must be used inside <DeployProvider>')
  return value
}
