import { describe, expect, it } from 'vitest'
import { createAllowlistFeatureHas } from '../src/allowlist-feature-has'

describe('createAllowlistFeatureHas', () => {
  it('returns null when unset', () => {
    expect(createAllowlistFeatureHas(undefined)).toBeNull()
    expect(createAllowlistFeatureHas('')).toBeNull()
    expect(createAllowlistFeatureHas('   ')).toBeNull()
  })

  it('grants listed feature slugs', () => {
    const has = createAllowlistFeatureHas('graphs, geo_export')!
    expect(has({ feature: 'graphs' })).toBe(true)
    expect(has({ feature: 'geo_export' })).toBe(true)
    expect(has({ feature: 'unknown_feature' })).toBe(false)
  })

  it('grants all checks when set to *', () => {
    const has = createAllowlistFeatureHas('*')!
    expect(has({ feature: 'anything' })).toBe(true)
    expect(has({ plan: 'any-plan' })).toBe(true)
  })

  it('grants all checks when set to all (case insensitive)', () => {
    const has = createAllowlistFeatureHas('ALL')!
    expect(has({ feature: 'x' })).toBe(true)
  })
})