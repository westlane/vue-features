import { describe, expect, it, vi } from 'vitest'
import { createDevFeatureEventBus } from '../src/dev/create-dev-event-bus'
import { FeatureEvents } from '../src/types'

describe('createDevFeatureEventBus', () => {
  it('logs widget signals and notifies listeners', () => {
    const bus = createDevFeatureEventBus()
    const listener = vi.fn()
    bus.on(FeatureEvents.widgetSignal, listener)

    bus.emit(FeatureEvents.widgetSignal, {
      instanceId: 'i-1',
      featureKey: 'chart',
      signal: 'ready',
    })

    expect(bus.signalLog[0]).toMatchObject({
      featureKey: 'chart',
      signal: 'ready',
    })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('emits host context changes', () => {
    const bus = createDevFeatureEventBus()
    const listener = vi.fn()
    bus.on(FeatureEvents.hostContextChanged, listener)

    bus.emitHostContextChanged({ writeEnabled: true })
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        event: FeatureEvents.hostContextChanged,
        hostContext: { writeEnabled: true },
      }),
    )
  })

  it('removes listeners with off', () => {
    const bus = createDevFeatureEventBus()
    const listener = vi.fn()
    bus.on(FeatureEvents.widgetReady, listener)
    bus.off(FeatureEvents.widgetReady, listener)
    bus.emit(FeatureEvents.widgetReady, { instanceId: 'i-1' })
    expect(listener).not.toHaveBeenCalled()
  })
})
