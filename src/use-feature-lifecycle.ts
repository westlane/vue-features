import { getCurrentScope, onScopeDispose, ref, watch, type ShallowRef } from 'vue'
import { FeatureEvents, type FeatureEventBus, type FeatureWidgetErrorPhase } from './types'

export type UseFeatureLifecycleOptions = {
  events?: {
    mounting?: string
    ready?: string
    error?: string
    disposed?: string
  }
}

export function useFeatureLifecycle(
  props: {
    instanceId?: string
    featureKey?: string
    tag?: string
  },
  bus: ShallowRef<FeatureEventBus | undefined>,
  options: UseFeatureLifecycleOptions = {},
) {
  const events = {
    mounting: options.events?.mounting ?? FeatureEvents.widgetMounting,
    ready: options.events?.ready ?? FeatureEvents.widgetReady,
    error: options.events?.error ?? FeatureEvents.widgetError,
    disposed: options.events?.disposed ?? FeatureEvents.widgetDisposed,
  }

  const mountedAt = ref<number | undefined>()

  watch(
    bus,
    (eventBus) => {
      if (!eventBus || !props.instanceId) return
      const onMounting = (payload: unknown) => {
        const row = payload as { instanceId?: string }
        if (row.instanceId === props.instanceId) mountedAt.value = Date.now()
      }
      eventBus.on(events.mounting, onMounting)
      return () => eventBus.off(events.mounting, onMounting)
    },
    { immediate: true },
  )

  function lifecyclePayload() {
    const instanceId = props.instanceId
    const featureKey = props.featureKey
    const tag = props.tag
    const eventBus = bus.value
    if (!eventBus || !instanceId || !featureKey || !tag) return null
    return { eventBus, instanceId, featureKey, tag }
  }

  let readyEmitted = false

  function reportReady(): void {
    if (readyEmitted) return
    const ctx = lifecyclePayload()
    if (!ctx) return
    readyEmitted = true
    const durationMs = mountedAt.value !== undefined ? Date.now() - mountedAt.value : undefined
    ctx.eventBus.emit(events.ready, {
      instanceId: ctx.instanceId,
      featureKey: ctx.featureKey,
      tag: ctx.tag,
      durationMs,
    })
  }

  function reportError(phase: FeatureWidgetErrorPhase, message: string): void {
    const ctx = lifecyclePayload()
    if (!ctx) return
    ctx.eventBus.emit(events.error, {
      instanceId: ctx.instanceId,
      featureKey: ctx.featureKey,
      tag: ctx.tag,
      phase,
      message,
      success: false,
    })
  }

  function reportDisposed(): void {
    const ctx = lifecyclePayload()
    if (!ctx) return
    ctx.eventBus.emit(events.disposed, {
      instanceId: ctx.instanceId,
      featureKey: ctx.featureKey,
      tag: ctx.tag,
    })
  }

  if (getCurrentScope()) {
    onScopeDispose(() => reportDisposed())
  }

  return { reportReady, reportError, reportDisposed }
}
