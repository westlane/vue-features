import { computed, getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'
import {
  FeatureEvents,
  type FeatureEventBus,
  type FeatureInstanceState,
  type FeatureMount,
} from './types'

export type UseFeatureInstanceRegistryOptions = {
  events?: {
    mounting?: string
    ready?: string
    error?: string
    unmounting?: string
    disposed?: string
  }
}

type InstanceRecord = {
  featureKey: string
  tag: string
  state: FeatureInstanceState
}

export function useFeatureInstanceRegistry(
  bus: FeatureEventBus,
  launchMounts: Ref<readonly FeatureMount[]>,
  options: UseFeatureInstanceRegistryOptions = {},
) {
  const events = {
    mounting: options.events?.mounting ?? FeatureEvents.widgetMounting,
    ready: options.events?.ready ?? FeatureEvents.widgetReady,
    error: options.events?.error ?? FeatureEvents.widgetError,
    unmounting: options.events?.unmounting ?? FeatureEvents.widgetUnmounting,
    disposed: options.events?.disposed ?? FeatureEvents.widgetDisposed,
  }

  const instances = ref(new Map<string, InstanceRecord>())

  function syncExpected(mounts: readonly FeatureMount[]): void {
    const map = new Map(instances.value)
    const expected = new Set(mounts.map((row) => row.id))
    for (const id of map.keys()) {
      if (!expected.has(id)) map.delete(id)
    }
    for (const row of mounts) {
      if (map.has(row.id)) continue
      map.set(row.id, {
        featureKey: row.featureKey,
        tag: row.tag,
        state: 'mounting',
      })
    }
    instances.value = map
  }

  watch(launchMounts, (mounts) => syncExpected(mounts), { immediate: true })

  function setState(instanceId: string, state: FeatureInstanceState, seed?: InstanceRecord): void {
    const record = instances.value.get(instanceId) ?? seed
    if (!record) return
    const map = new Map(instances.value)
    map.set(instanceId, { ...record, state })
    instances.value = map
  }

  function onMounting(payload: unknown) {
    const row = payload as { instanceId?: string; featureKey?: string; tag?: string }
    if (!row.instanceId || !row.featureKey || !row.tag) return
    setState(row.instanceId, 'mounting', {
      featureKey: row.featureKey,
      tag: row.tag,
      state: 'mounting',
    })
  }

  function onReady(payload: unknown) {
    const row = payload as { instanceId?: string }
    if (row.instanceId) setState(row.instanceId, 'ready')
  }

  function onError(payload: unknown) {
    const row = payload as { instanceId?: string }
    if (row.instanceId) setState(row.instanceId, 'error')
  }

  function onUnmounting(payload: unknown) {
    const row = payload as { instanceId?: string }
    if (row.instanceId) setState(row.instanceId, 'unmounting')
  }

  function onDisposed(payload: unknown) {
    const row = payload as { instanceId?: string }
    if (!row.instanceId) return
    const map = new Map(instances.value)
    map.delete(row.instanceId)
    instances.value = map
  }

  bus.on(events.mounting, onMounting)
  bus.on(events.ready, onReady)
  bus.on(events.error, onError)
  bus.on(events.unmounting, onUnmounting)
  bus.on(events.disposed, onDisposed)

  if (getCurrentScope()) {
    onScopeDispose(() => {
      bus.off(events.mounting, onMounting)
      bus.off(events.ready, onReady)
      bus.off(events.error, onError)
      bus.off(events.unmounting, onUnmounting)
      bus.off(events.disposed, onDisposed)
    })
  }

  const allInstancesSettled = computed(() => {
    if (launchMounts.value.length === 0) return false
    const map = instances.value
    return launchMounts.value.every((row) => {
      const state = map.get(row.id)?.state
      return state === 'ready' || state === 'error'
    })
  })

  const hasInstanceErrors = computed(() =>
    [...instances.value.values()].some((record) => record.state === 'error'),
  )

  return { instances, allInstancesSettled, hasInstanceErrors }
}
