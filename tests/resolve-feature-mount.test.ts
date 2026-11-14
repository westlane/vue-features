import { describe, expect, it } from 'vitest'
import { findFeatureEntry, resolveFeatureMount } from '../src/resolve-feature-mount'

describe('resolveFeatureMount', () => {
  const entry = {
    key: 'export',
    tag: 'app-export',
    parseParams: (raw: unknown) => raw,
  }

  it('resolves tag, spec, and host context', () => {
    const mount = resolveFeatureMount(
      entry,
      { id: 'exp-1', featureKey: 'export', params: { mode: 'viewport' } },
      { writeEnabled: true },
    )
    expect(mount).toEqual({
      id: 'exp-1',
      featureKey: 'export',
      tag: 'app-export',
      spec: { mode: 'viewport' },
      hostContext: { writeEnabled: true },
    })
  })

  it('rejects mismatched instance keys', () => {
    expect(() =>
      resolveFeatureMount(entry, { id: 'x', featureKey: 'chart', params: {} }, {}),
    ).toThrow(/does not match/)
  })

  it('finds registry entries by key', () => {
    expect(findFeatureEntry([entry], 'export')).toBe(entry)
    expect(findFeatureEntry([entry], 'missing')).toBeUndefined()
  })
})
