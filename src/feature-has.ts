import { mergeFeatureHas } from './filter-entitled-features'
import type { FeatureHas } from './types'

/** Combine entitlement sources; returns `undefined` when none are present. */
export function combineFeatureHas(
  ...sources: Array<FeatureHas | null | undefined>
): FeatureHas | undefined {
  const active = sources.filter((row): row is FeatureHas => typeof row === 'function')
  if (active.length === 0) return undefined
  if (active.length === 1) return active[0]
  return mergeFeatureHas(active)
}