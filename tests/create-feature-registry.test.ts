import { describe, expect, it } from 'vitest'
import { createFeatureRegistry } from '../src/create-feature-registry'

describe('createFeatureRegistry', () => {
  it('registers and looks up by key', () => {
    const registry = createFeatureRegistry([{ key: 'chart', load: async () => ({}) }])
    expect(registry.has('chart')).toBe(true)
    expect(registry.get('chart')?.key).toBe('chart')
    expect(registry.has('missing')).toBe(false)
  })

  it('rejects unknown generative keys by omission', () => {
    const registry = createFeatureRegistry()
    registry.register({ key: 'export', load: async () => ({}) })
    expect(registry.keys()).toEqual(['export'])
    expect(registry.get('inject-me')).toBeUndefined()
  })
})
