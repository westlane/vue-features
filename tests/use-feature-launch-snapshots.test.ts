import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useFeatureLaunchSnapshots } from '../src/use-feature-launch-snapshots'
import type { FeatureMount } from '../src/types'

describe('useFeatureLaunchSnapshots', () => {
  it('freezes launch props per instance id', async () => {
    const mounts = ref<FeatureMount[]>([
      {
        id: 'chart-1',
        featureKey: 'chart',
        tag: 'app-chart',
        spec: { title: 'Initial' },
        hostContext: { visibleCount: 2 },
      },
    ])
    const { launchMounts } = useFeatureLaunchSnapshots(mounts)
    expect(launchMounts.value[0].spec).toEqual({ title: 'Initial' })
    expect((launchMounts.value[0].hostContext as { visibleCount: number }).visibleCount).toBe(2)

    mounts.value = [
      {
        id: 'chart-1',
        featureKey: 'chart',
        tag: 'app-chart',
        spec: { title: 'Updated' },
        hostContext: { visibleCount: 99 },
      },
    ]
    await nextTick()

    expect(launchMounts.value[0].spec).toEqual({ title: 'Initial' })
    expect((launchMounts.value[0].hostContext as { visibleCount: number }).visibleCount).toBe(2)
  })

  it('drops snapshots when mounts leave', async () => {
    const mounts = ref<FeatureMount[]>([
      {
        id: 'a',
        featureKey: 'export',
        tag: 'app-export',
        spec: {},
        hostContext: {},
      },
    ])
    const { launchMounts } = useFeatureLaunchSnapshots(mounts)
    expect(launchMounts.value).toHaveLength(1)
    mounts.value = []
    await nextTick()
    expect(launchMounts.value).toHaveLength(0)
  })
})
