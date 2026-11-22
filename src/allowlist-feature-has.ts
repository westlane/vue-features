import type { FeatureHas } from './types'

/**
 * Build a {@link FeatureHas} from a comma-separated allowlist string.
 * `*` / `all` grants every feature/plan check.
 */
export function createAllowlistFeatureHas(raw: string | undefined | null): FeatureHas | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  if (trimmed === '*' || trimmed.toLowerCase() === 'all') {
    return () => true
  }

  const allowed = new Set(
    trimmed
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  )

  return (params) => {
    if (params.feature && allowed.has(params.feature)) return true
    if (params.plan && allowed.has(params.plan)) return true
    return false
  }
}