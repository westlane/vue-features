import { computed, type ComputedRef, type Ref } from 'vue'
import { filterEntitledFeatures } from './filter-entitled-features'
import {
  findFeatureEntry,
  resolveFeatureMount,
  type FeatureInstance,
  type FeatureMountEntry,
} from './resolve-feature-mount'
import type { FeatureEntitlement, FeatureHas, FeatureMount } from './types'

export type EntitledFeatureRegistryEntry = FeatureMountEntry & {
  key: string
  entitlement: FeatureEntitlement
}

export type UseResolvedFeatureMountsOptions<THostContext> = {
  cloneHostContext?: (ctx: THostContext) => THostContext
}

export function useResolvedFeatureMounts<THostContext>(
  registry: readonly EntitledFeatureRegistryEntry[],
  hostContext: Ref<THostContext | null>,
  has: Ref<FeatureHas | undefined>,
  layout: Ref<readonly FeatureInstance[]>,
  options: UseResolvedFeatureMountsOptions<THostContext> = {},
): { mountedFeatures: ComputedRef<FeatureMount<THostContext>[]> } {
  const clone = options.cloneHostContext ?? ((ctx: THostContext) => ctx)

  const mountedFeatures = computed(() => {
    const ctx = hostContext.value
    const checker = has.value
    if (!ctx || !checker) return []

    const entitledKeys = new Set(
      filterEntitledFeatures(registry, checker).map((entry) => entry.key),
    )

    const mounts: FeatureMount<THostContext>[] = []
    for (const instance of layout.value) {
      if (!entitledKeys.has(instance.featureKey)) continue
      const entry = findFeatureEntry(registry, instance.featureKey)
      if (!entry) continue
      const plain = clone(ctx)
      mounts.push(resolveFeatureMount(entry, instance, plain))
    }
    return mounts
  })

  return { mountedFeatures }
}