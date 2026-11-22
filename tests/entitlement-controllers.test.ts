import { describe, expect, it, vi } from 'vitest'
import { createAllowlistFeatureHas } from '../src/allowlist-feature-has'
import { resolveEntitlementHas } from '../src/entitlement-controllers'

describe('resolveEntitlementHas', () => {
  it('uses allowlist when billing controller is disabled', () => {
    const has = resolveEntitlementHas([
      {
        id: 'billing',
        enabled: false,
        resolve: () => () => false,
      },
      {
        id: 'allowlist',
        resolve: () => createAllowlistFeatureHas('share'),
      },
    ])

    expect(has).toBeDefined()
    expect(has!({ feature: 'share' })).toBe(true)
    expect(has!({ feature: 'graphs' })).toBe(false)
  })

  it('merges billing and allowlist when both are enabled', () => {
    const billing = vi.fn((params: { feature?: string }) => params.feature === 'from_billing')
  const has = resolveEntitlementHas([
      {
        id: 'billing',
        enabled: true,
        resolve: () => (params) =>
          params.feature ? billing({ feature: params.feature }) : false,
      },
      {
        id: 'allowlist',
        resolve: () => createAllowlistFeatureHas('graphs'),
      },
    ])!

    expect(has({ feature: 'from_billing' })).toBe(true)
    expect(has({ feature: 'graphs' })).toBe(true)
    expect(has({ feature: 'none' })).toBe(false)
  })
})