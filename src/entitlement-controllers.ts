import type { FeatureHas } from './types'
import { combineFeatureHas } from './feature-has'

export type EntitlementController = {
  id?: string
  enabled?: boolean | (() => boolean)
  resolve: () => FeatureHas | null | undefined
}

function controllerEnabled(controller: EntitlementController): boolean {
  const gate = controller.enabled
  if (gate === undefined) return true
  return typeof gate === 'function' ? gate() : gate
}

/** Merge active entitlement controllers into a single {@link FeatureHas}. */
export function resolveEntitlementHas(
  controllers: readonly EntitlementController[],
): FeatureHas | undefined {
  const sources = controllers
    .filter(controllerEnabled)
    .map((controller) => controller.resolve())
  return combineFeatureHas(...sources)
}