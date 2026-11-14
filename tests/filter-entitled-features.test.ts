import { describe, expect, it, vi } from 'vitest'
import {
  filterEntitledFeatures,
  isFeatureEntitled,
  mergeFeatureHas,
} from '../src/filter-entitled-features'

describe('filterEntitledFeatures', () => {
  const registry = [
    { key: 'export', entitlement: { feature: 'geo_export' } },
    { key: 'chart', entitlement: { feature: 'graphs' } },
    { key: 'import', entitlement: { feature: 'geo_import' } },
  ] as const

  it('is false when has() is unavailable', () => {
    expect(isFeatureEntitled({ feature: 'geo_export' }, undefined)).toBe(false)
  })

  it('filters by feature entitlement', () => {
    const has = vi.fn((params: { feature?: string }) => params.feature === 'geo_export')
    expect(filterEntitledFeatures(registry, has).map((row) => row.key)).toEqual(['export'])
  })

  it('returns empty when nothing is entitled', () => {
    expect(filterEntitledFeatures(registry, () => false)).toEqual([])
  })

  it('merges entitlement sources with OR', () => {
    const has = mergeFeatureHas([() => false, (params) => params.feature === 'graphs'])
    expect(has({ feature: 'graphs' })).toBe(true)
    expect(has({ feature: 'geo_export' })).toBe(false)
  })
})
