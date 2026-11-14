import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'
import { FeatureEvents } from '../src/types'
import { useFeatureLifecycle } from '../src/use-feature-lifecycle'
import { createTestBus } from './test-bus'

describe('useFeatureLifecycle', () => {
  it('emits ready once with duration after mounting', async () => {
    const bus = createTestBus()
    const busRef = shallowRef(bus)
    const scope = effectScope()
    const { reportReady } = scope.run(() =>
      useFeatureLifecycle(
        { instanceId: 'i-1', featureKey: 'chart', tag: 'app-chart' },
        busRef,
      ),
    )!

    bus.emit(FeatureEvents.widgetMounting, { instanceId: 'i-1' })
    await nextTick()
    reportReady()
    reportReady()

    const ready = bus.log.filter((row) => row.event === FeatureEvents.widgetReady)
    expect(ready).toHaveLength(1)
    expect(ready[0].payload).toMatchObject({
      instanceId: 'i-1',
      featureKey: 'chart',
      tag: 'app-chart',
    })
    expect((ready[0].payload as { durationMs?: number }).durationMs).toBeTypeOf('number')
    scope.stop()
  })

  it('emits error with phase and message', () => {
    const bus = createTestBus()
    const busRef = shallowRef(bus)
    const scope = effectScope()
    const { reportError } = scope.run(() =>
      useFeatureLifecycle(
        { instanceId: 'i-1', featureKey: 'chart', tag: 'app-chart' },
        busRef,
      ),
    )!

    reportError('runtime', 'bad spec')
    expect(bus.log.at(-1)).toMatchObject({
      event: FeatureEvents.widgetError,
      payload: {
        instanceId: 'i-1',
        phase: 'runtime',
        message: 'bad spec',
        success: false,
      },
    })
    scope.stop()
  })

  it('no-ops when instance identity is incomplete', () => {
    const bus = createTestBus()
    const busRef = shallowRef(bus)
    const scope = effectScope()
    const { reportReady, reportError } = scope.run(() =>
      useFeatureLifecycle({ instanceId: 'i-1' }, busRef),
    )!

    reportReady()
    reportError('mount', 'x')
    expect(bus.log).toHaveLength(0)
    scope.stop()
  })
})
