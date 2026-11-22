import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { useResolvedFeatureMounts } from '../src/use-resolved-feature-mounts'

describe('useResolvedFeatureMounts', () => {
  const registry = [
    {
      key: 'export',
      tag: 'fw-export',
      entitlement: { feature: 'geo_export' },
      parseParams: (raw: unknown) => raw,
    },
    {
      key: 'import',
      tag: 'fw-import',
      entitlement: { feature: 'geo_import' },
      parseParams: (raw: unknown) => raw,
    },
  ] as const

  it('returns empty mounts when host context or has() is missing', () => {
    const hostContext = ref<{ slug: string } | null>({ slug: 'demo' })
    const has = ref<((params: { feature?: string }) => boolean) | undefined>(undefined)
    const layout = ref([
      { id: 'export-1', featureKey: 'export', params: { version: 1 } },
    ])

    const { mountedFeatures } = useResolvedFeatureMounts(registry, hostContext, has, layout)
    expect(mountedFeatures.value).toEqual([])
  })

  it('includes only entitled layout instances', () => {
    const hostContext = ref({ slug: 'demo', visibleCount: 2 })
    const has = ref((params: { feature?: string }) => params.feature === 'geo_export')
    const layout = ref([
      { id: 'export-1', featureKey: 'export', params: { version: 1, mode: 'viewport' } },
      { id: 'import-1', featureKey: 'import', params: { version: 1 } },
    ])

    const { mountedFeatures } = useResolvedFeatureMounts(registry, hostContext, has, layout)
    expect(mountedFeatures.value).toHaveLength(1)
    expect(mountedFeatures.value[0]).toMatchObject({
      id: 'export-1',
      featureKey: 'export',
      tag: 'fw-export',
      spec: { version: 1, mode: 'viewport' },
      hostContext: { slug: 'demo', visibleCount: 2 },
    })
  })

  it('clones host context when cloneHostContext is provided', () => {
    const hostContext = ref({ slug: 'raw', extra: 1 })
    const has = ref(() => true)
    const layout = computed(() => [
      { id: 'export-1', featureKey: 'export', params: {} },
    ])

    const { mountedFeatures } = useResolvedFeatureMounts(registry, hostContext, has, layout, {
      cloneHostContext: (ctx) => ({ ...ctx, extra: 0 }),
    })

    expect(mountedFeatures.value[0]?.hostContext).toEqual({ slug: 'raw', extra: 0 })
    expect(mountedFeatures.value[0]?.hostContext).not.toBe(hostContext.value)
  })
})