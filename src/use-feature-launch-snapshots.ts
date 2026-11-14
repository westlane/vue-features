import { computed, markRaw, ref, watch, type Ref } from 'vue'
import type { FeatureMount } from './types'

function defaultFreeze<THostContext>(
  spec: unknown,
  hostContext: THostContext,
): { spec: unknown; hostContext: THostContext } {
  try {
    return {
      spec: structuredClone(spec),
      hostContext: structuredClone(hostContext),
    }
  } catch {
    return {
      spec: JSON.parse(JSON.stringify(spec)) as unknown,
      hostContext: JSON.parse(JSON.stringify(hostContext)) as THostContext,
    }
  }
}

export type FreezeFeatureLaunch = <THostContext>(
  spec: unknown,
  hostContext: THostContext,
) => { spec: unknown; hostContext: THostContext }

export type UseFeatureLaunchSnapshotsOptions = {
  /** Override launch freeze (e.g. Fieldwise `snapshotFeatureLaunch`). */
  freeze?: FreezeFeatureLaunch
}

/**
 * Freezes launch props per feature instance id.
 * Later host updates to the same id are ignored until remount.
 */
export function useFeatureLaunchSnapshots(
  mounts: Ref<readonly FeatureMount[]>,
  options: UseFeatureLaunchSnapshotsOptions = {},
) {
  const freeze = options.freeze ?? defaultFreeze
  const byId = ref(new Map<string, FeatureMount>())

  watch(
    mounts,
    (current) => {
      const map = new Map(byId.value)
      const ids = new Set(current.map((mount) => mount.id))
      for (const mount of current) {
        if (map.has(mount.id)) continue
        const launch = freeze(mount.spec, mount.hostContext)
        map.set(
          mount.id,
          markRaw({
            id: mount.id,
            featureKey: mount.featureKey,
            tag: mount.tag,
            spec: launch.spec,
            hostContext: launch.hostContext,
          }),
        )
      }
      for (const id of map.keys()) {
        if (!ids.has(id)) map.delete(id)
      }
      byId.value = map
    },
    { immediate: true },
  )

  const launchMounts = computed(() => [...byId.value.values()] as FeatureMount[])
  return { launchMounts }
}
