import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, reactive } from 'vue'
import { FeatureEvents } from '../src/types'
import { useFeatureRuntime } from '../src/use-feature-runtime'
import { createTestBus } from './test-bus'

describe('useFeatureRuntime', () => {
  it('freezes launch spec and host context', async () => {
    const bus = createTestBus()
    const props = reactive({
      spec: { title: 'A' },
      hostContext: { writeEnabled: true },
      eventBus: bus,
      instanceId: 'i-1',
      featureKey: 'chart',
      tag: 'app-chart',
    })
    const scope = effectScope()
    const runtime = scope.run(() => useFeatureRuntime(props))!
    await nextTick()

    expect(runtime.spec.value).toEqual({ title: 'A' })
    expect(runtime.hostContext.value).toEqual({ writeEnabled: true })

    props.spec = { title: 'B' }
    props.hostContext = { writeEnabled: false }
    await nextTick()

    expect(runtime.spec.value).toEqual({ title: 'A' })
    expect(runtime.hostContext.value).toEqual({ writeEnabled: true })
    scope.stop()
  })

  it('updates host context from bus after launch', async () => {
    const bus = createTestBus()
    const props = reactive({
      spec: { title: 'A' },
      hostContext: { writeEnabled: true, count: 1 },
      eventBus: bus,
      instanceId: 'i-1',
      featureKey: 'chart',
      tag: 'app-chart',
    })
    const scope = effectScope()
    const runtime = scope.run(() => useFeatureRuntime(props))!
    await nextTick()

    bus.emit(FeatureEvents.hostContextChanged, {
      hostContext: { writeEnabled: false, count: 9 },
    })
    await nextTick()

    expect(runtime.hostContext.value).toEqual({ writeEnabled: false, count: 9 })
    scope.stop()
  })

  it('emits widget signals on the bus', async () => {
    const bus = createTestBus()
    const props = reactive({
      spec: {},
      hostContext: {},
      eventBus: bus,
      instanceId: 'i-1',
      featureKey: 'export',
      tag: 'app-export',
    })
    const scope = effectScope()
    const { emitSignal } = scope.run(() => useFeatureRuntime(props))!
    await nextTick()

    emitSignal('export.done', { rows: 3 })
    expect(bus.log.at(-1)).toMatchObject({
      event: FeatureEvents.widgetSignal,
      payload: {
        instanceId: 'i-1',
        featureKey: 'export',
        signal: 'export.done',
        detail: { rows: 3 },
      },
    })
    scope.stop()
  })

  it('resolves bus from getGlobalBus when eventBus is omitted', async () => {
    const bus = createTestBus()
    const props = reactive({
      spec: { ok: true },
      hostContext: { writeEnabled: true },
      instanceId: 'i-1',
      featureKey: 'chart',
      tag: 'app-chart',
    })
    const scope = effectScope()
    const runtime = scope.run(() =>
      useFeatureRuntime(props, { getGlobalBus: () => bus }),
    )!
    await nextTick()

    runtime.emitSignal('ping')
    expect(bus.log.some((row) => row.event === FeatureEvents.widgetSignal)).toBe(true)
    scope.stop()
  })
})
