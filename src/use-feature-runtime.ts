import { onBeforeUnmount, shallowRef, watch, watchEffect, type ShallowRef } from 'vue'
import { FeatureEvents, type FeatureEventBus } from './types'
import { useFeatureLifecycle } from './use-feature-lifecycle'
import { useLaunchOnce } from './use-launch-once'

function useFeatureEventBus(props: {
  eventBus?: FeatureEventBus
  getGlobalBus?: () => FeatureEventBus | undefined
}): ShallowRef<FeatureEventBus | undefined> {
  const bus = shallowRef<FeatureEventBus>()
  watchEffect(() => {
    const next = props.eventBus ?? props.getGlobalBus?.() ?? undefined
    if (next) bus.value = next
  })
  return bus
}

function useLiveHostContext<THostContext>(
  launchHostContext: ShallowRef<THostContext | undefined>,
  bus: ShallowRef<FeatureEventBus | undefined>,
  liveHostContextProp: () => THostContext | undefined,
  contextChangedEvent: string,
  cloneHostContext: (ctx: THostContext) => THostContext,
): ShallowRef<THostContext | undefined> {
  const hostContext = shallowRef<THostContext>()
  let unsubscribe: (() => void) | undefined
  let propsFrozen = false

  watch(
    launchHostContext,
    (ctx) => {
      if (ctx) {
        propsFrozen = true
        if (!hostContext.value) hostContext.value = cloneHostContext(ctx)
      }
    },
    { immediate: true },
  )

  watch(
    liveHostContextProp,
    (ctx) => {
      if (propsFrozen) return
      if (ctx) hostContext.value = cloneHostContext(ctx)
    },
    { deep: true, immediate: true },
  )

  watch(
    bus,
    (eventBus) => {
      unsubscribe?.()
      unsubscribe = undefined
      if (!eventBus) return
      const onContext = (payload: unknown) => {
        const row = payload as { hostContext?: THostContext }
        if (row.hostContext) hostContext.value = cloneHostContext(row.hostContext)
      }
      eventBus.on(contextChangedEvent, onContext)
      unsubscribe = () => eventBus.off(contextChangedEvent, onContext)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => unsubscribe?.())

  return hostContext
}

function defaultClone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export type UseFeatureRuntimeOptions<THostContext = unknown> = {
  getGlobalBus?: () => FeatureEventBus | undefined
  contextChangedEvent?: string
  signalEvent?: string
  cloneHostContext?: (ctx: THostContext) => THostContext
}

export function useFeatureRuntime<THostContext = unknown>(
  props: {
    spec?: unknown
    hostContext?: THostContext
    eventBus?: FeatureEventBus
    instanceId?: string
    featureKey?: string
    tag?: string
  },
  options: UseFeatureRuntimeOptions<THostContext> = {},
) {
  const { spec, hostContext: launchHostContext } = useLaunchOnce(props)
  const bus = useFeatureEventBus({
    eventBus: props.eventBus,
    getGlobalBus: options.getGlobalBus,
  })
  const hostContext = useLiveHostContext(
    launchHostContext,
    bus,
    () => props.hostContext,
    options.contextChangedEvent ?? FeatureEvents.hostContextChanged,
    options.cloneHostContext ?? defaultClone,
  )
  const { reportReady, reportError, reportDisposed } = useFeatureLifecycle(props, bus)

  function emitSignal(signal: string, detail?: Record<string, unknown>): void {
    const eventBus = bus.value
    const instanceId = props.instanceId
    const featureKey = props.featureKey
    if (!eventBus || !instanceId || !featureKey) return
    eventBus.emit(options.signalEvent ?? FeatureEvents.widgetSignal, {
      instanceId,
      featureKey,
      signal,
      detail,
    })
  }

  return { spec, hostContext, bus, emitSignal, reportReady, reportError, reportDisposed }
}
