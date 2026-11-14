import { watch, type Ref } from 'vue'
import { FeatureEvents, type FeatureEventBus, type FeatureMount } from './types'

export type UseFeatureMountLifecycleOptions = {
  events?: {
    mounting?: string
    unmounting?: string
  }
}

/** Host-side: emit mounting / unmounting as the launch list diffs. */
export function useFeatureMountLifecycle(
  bus: FeatureEventBus,
  launchMounts: Ref<readonly FeatureMount[]>,
  options: UseFeatureMountLifecycleOptions = {},
): void {
  const mounting = options.events?.mounting ?? FeatureEvents.widgetMounting
  const unmounting = options.events?.unmounting ?? FeatureEvents.widgetUnmounting

  watch(
    launchMounts,
    (current, previous) => {
      const prevIds = new Set((previous ?? []).map((row) => row.id))
      const nextIds = new Set(current.map((row) => row.id))

      for (const row of current) {
        if (prevIds.has(row.id)) continue
        bus.emit(mounting, {
          instanceId: row.id,
          featureKey: row.featureKey,
          tag: row.tag,
        })
      }

      for (const row of previous ?? []) {
        if (nextIds.has(row.id)) continue
        bus.emit(unmounting, {
          instanceId: row.id,
          featureKey: row.featureKey,
          tag: row.tag,
        })
      }
    },
    { immediate: true },
  )
}
