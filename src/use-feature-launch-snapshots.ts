import { computed, markRaw, ref, watch, type Ref } from 'vue'
import { cloneValue } from './clone-value'
import type { FeatureMount } from './types'

export type FreezeFeatureLaunch = <THostContext>(
  spec: unknown,
  hostContext: THostContext,
) => { spec: unknown; hostContext: THostContext }

export type UseFeatureLaunchSnapshotsOptions = {
  freeze?: FreezeFeatureLaunch
}

function defaultFreeze<THostContext>(
  spec: unknown,
  hostContext: THostContext,
): { spec: unknown; hostContext: THostContext } {
  return {
    spec: cloneValue(spec),
    hostContext: cloneValue(hostContext),
  }
}

/** Freeze launch props per instance id until remount. */
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

  const launchMounts = computed(() => [...byId.value.values()])
  return { launchMounts }
}
