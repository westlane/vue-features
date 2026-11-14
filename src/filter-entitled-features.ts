import type { FeatureEntitlement, FeatureHas } from './types'

export function isFeatureEntitled(
  entitlement: FeatureEntitlement,
  has: FeatureHas | undefined,
): boolean {
  if (!has) return false
  if (entitlement.feature) return has({ feature: entitlement.feature })
  if (entitlement.plan) return has({ plan: entitlement.plan })
  return false
}

export function filterEntitledFeatures<T extends { entitlement: FeatureEntitlement }>(
  registry: readonly T[],
  has: FeatureHas | undefined,
): T[] {
  return registry.filter((entry) => isFeatureEntitled(entry.entitlement, has))
}

/** OR-merge entitlement sources (flags + billing + env). */
export function mergeFeatureHas(checks: FeatureHas[]): FeatureHas {
  return (params) => checks.some((check) => check(params))
}
