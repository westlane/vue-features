import { describe, expect, it, vi } from 'vitest'
import { defineFeatureEntry } from '../src/define-feature-entry'

describe('defineFeatureEntry', () => {
  it('returns mount/unmount contract', async () => {
    const el = document.createElement('div')
    const mountFn = vi.fn()
    const unmount = vi.fn()
    const entry = defineFeatureEntry({ mount: mountFn, unmount })
    await entry.mount(el, { n: 1 })
    expect(mountFn).toHaveBeenCalledWith(el, { n: 1 })
    await entry.unmount?.(el)
    expect(unmount).toHaveBeenCalledWith(el)
  })

  it('requires mount', () => {
    expect(() => defineFeatureEntry({ mount: undefined as never })).toThrow(/mount/)
  })
})
