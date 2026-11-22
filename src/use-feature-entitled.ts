import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { FeatureEntitlement, FeatureHas } from './types'
import { isFeatureEntitled } from './filter-entitled-features'

export function useFeatureEntitled(
  entitlement: FeatureEntitlement,
  has: MaybeRefOrGetter<FeatureHas | undefined>,
): ComputedRef<boolean> {
  return computed(() => isFeatureEntitled(entitlement, toValue(has)))
}