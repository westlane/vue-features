import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { FeatureEvents } from '../src/types'
import { useBroadcastHostContext } from '../src/use-broadcast-host-context'
import { useFeatureInstanceRegistry } from '../src/use-feature-instance-registry'
import { useFeatureMountLifecycle } from '../src/use-feature-mount-lifecycle'
import { createTestBus } from './test-bus'

function mount(id: string, featureKey = 'export', tag = 'app-export') {
  return { id, featureKey, tag, spec: {}, hostContext: { writeEnabled: true } }
}

describe('host feature lifecycle', () => {
  it('emits mounting and unmounting when launch mounts change', async () => {
    const bus = createTestBus()
    const launchMounts = ref([mount('a-1')])
    const scope = effectScope()
    scope.run(() => useFeatureMountLifecycle(bus, launchMounts))
    await nextTick()

    expect(bus.log.filter((row) => row.event === FeatureEvents.widgetMounting)).toHaveLength(1)

    launchMounts.value = []
    await nextTick()
    expect(bus.log.filter((row) => row.event === FeatureEvents.widgetUnmounting)).toHaveLength(1)
    scope.stop()
  })

  it('tracks instance registry through ready and error', async () => {
    const bus = createTestBus()
    const launchMounts = ref([mount('g-1', 'chart', 'app-chart')])
    const scope = effectScope()
    const { allInstancesSettled, hasInstanceErrors } = scope.run(() =>
      useFeatureInstanceRegistry(bus, launchMounts),
    )!

    bus.emit(FeatureEvents.widgetReady, { instanceId: 'g-1' })
    await nextTick()
    expect(allInstancesSettled.value).toBe(true)
    expect(hasInstanceErrors.value).toBe(false)

    bus.emit(FeatureEvents.widgetError, { instanceId: 'g-1' })
    await nextTick()
    expect(hasInstanceErrors.value).toBe(true)
    scope.stop()
  })

  it('broadcasts host context changes on the bus', async () => {
    const bus = createTestBus()
    const hostContext = ref<{ lockerSlug: string } | null>(null)
    const scope = effectScope()
    scope.run(() =>
      useBroadcastHostContext(hostContext, bus, {
        extra: (ctx) => ({ lockerSlug: ctx.lockerSlug }),
      }),
    )

    hostContext.value = { lockerSlug: 'demo' }
    await nextTick()

    expect(bus.log.at(-1)).toMatchObject({
      event: FeatureEvents.hostContextChanged,
      payload: {
        hostContext: { lockerSlug: 'demo' },
        lockerSlug: 'demo',
      },
    })
    scope.stop()
  })

  it('does not re-emit mounting for the same instance id', async () => {
    const bus = createTestBus()
    const row = mount('a-1')
    const launchMounts = ref([row])
    const scope = effectScope()
    scope.run(() => useFeatureMountLifecycle(bus, launchMounts))
    await nextTick()

    launchMounts.value = [{ ...row, spec: { version: 1 } }]
    await nextTick()

    expect(bus.log.filter((row) => row.event === FeatureEvents.widgetMounting)).toHaveLength(1)
    scope.stop()
  })

  it('clears instances on disposed and waits for all to settle', async () => {
    const bus = createTestBus()
    const launchMounts = ref([mount('a-1'), mount('g-1', 'chart', 'app-chart')])
    const scope = effectScope()
    const { allInstancesSettled, instances } = scope.run(() =>
      useFeatureInstanceRegistry(bus, launchMounts),
    )!

    bus.emit(FeatureEvents.widgetReady, { instanceId: 'a-1' })
    await nextTick()
    expect(allInstancesSettled.value).toBe(false)

    bus.emit(FeatureEvents.widgetReady, { instanceId: 'g-1' })
    await nextTick()
    expect(allInstancesSettled.value).toBe(true)

    bus.emit(FeatureEvents.widgetDisposed, { instanceId: 'a-1' })
    await nextTick()
    expect(instances.value.has('a-1')).toBe(false)
    scope.stop()
  })

  it('skips broadcast when host context is null', async () => {
    const bus = createTestBus()
    const hostContext = ref<{ lockerSlug: string } | null>(null)
    const scope = effectScope()
    scope.run(() => useBroadcastHostContext(hostContext, bus))
    await nextTick()
    expect(bus.log).toHaveLength(0)
    scope.stop()
  })
})

