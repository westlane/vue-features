import { describe, expect, it, vi } from 'vitest'
import { FeatureEvents } from '../src/types'
import {
  loadEntitledFeatures,
  loadFeatureElements,
  registerFeatureElement,
} from '../src/register-feature-element'

function createBus() {
  const events: { event: string; payload: Record<string, unknown> }[] = []
  return {
    events,
    emit(event: string, payload: Record<string, unknown> = {}) {
      events.push({ event, payload })
    },
    on() {},
    off() {},
  }
}

describe('registerFeatureElement', () => {
  it('loads and defines the custom element once', async () => {
    const tag = `vf-test-${Math.random().toString(36).slice(2)}`
    const bus = createBus()
    const ctor = class extends HTMLElement {}
    const load = vi.fn(async () => ({ default: ctor }))

    await registerFeatureElement({ key: 'export', tag, load }, bus)
    expect(load).toHaveBeenCalledTimes(1)
    expect(customElements.get(tag)).toBe(ctor)
    expect(bus.events.map((row) => row.event)).toEqual([
      FeatureEvents.chunkLoadStarted,
      FeatureEvents.chunkLoaded,
    ])

    await registerFeatureElement({ key: 'export', tag, load }, bus)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('emits load failed and rethrows', async () => {
    const tag = `vf-fail-${Math.random().toString(36).slice(2)}`
    const bus = createBus()
    const load = vi.fn(async () => {
      throw new Error('chunk missing')
    })

    await expect(registerFeatureElement({ key: 'chart', tag, load }, bus)).rejects.toThrow(
      'chunk missing',
    )
    expect(bus.events.at(-1)?.event).toBe(FeatureEvents.chunkLoadFailed)
  })

  it('loadFeatureElements registers all entries', async () => {
    const bus = createBus()
    const a = `vf-a-${Math.random().toString(36).slice(2)}`
    const b = `vf-b-${Math.random().toString(36).slice(2)}`
    await loadFeatureElements(
      [
        { key: 'a', tag: a, load: async () => ({ default: class extends HTMLElement {} }) },
        { key: 'b', tag: b, load: async () => ({ default: class extends HTMLElement {} }) },
      ],
      bus,
    )
    expect(customElements.get(a)).toBeTruthy()
    expect(customElements.get(b)).toBeTruthy()
  })

  it('loadEntitledFeatures registers only entitled entries', async () => {
    const bus = createBus()
    const entitledTag = `vf-ok-${Math.random().toString(36).slice(2)}`
    const skippedTag = `vf-no-${Math.random().toString(36).slice(2)}`
    const entitledLoad = vi.fn(async () => ({
      default: class extends HTMLElement {},
    }))
    const skippedLoad = vi.fn(async () => ({
      default: class extends HTMLElement {},
    }))

    const loaded = await loadEntitledFeatures(
      [
        {
          key: 'export',
          tag: entitledTag,
          entitlement: { feature: 'geo_export' },
          load: entitledLoad,
        },
        {
          key: 'chart',
          tag: skippedTag,
          entitlement: { feature: 'graphs' },
          load: skippedLoad,
        },
      ],
      (params) => params.feature === 'geo_export',
      bus,
    )

    expect(loaded.map((row) => row.key)).toEqual(['export'])
    expect(entitledLoad).toHaveBeenCalledTimes(1)
    expect(skippedLoad).not.toHaveBeenCalled()
    expect(customElements.get(entitledTag)).toBeTruthy()
    expect(customElements.get(skippedTag)).toBeUndefined()
  })
})

