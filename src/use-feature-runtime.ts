import {
  getCurrentScope,
  onScopeDispose,
  shallowRef,
  watch,
  watchEffect,
  type ShallowRef,
} from 'vue'
import { cloneValue } from './clone-value'
import { FeatureEvents, type FeatureEventBus } from './types'
import { useFeatureLifecycle } from './use-feature-lifecycle'
import { useLaunchOnce } from './use-launch-once'

function useFeatureEventBus(props: {
  eventBus?: FeatureEventBus
  getGlobalBus?: () => FeatureEventBus | undefined
}): ShallowRef<FeatureEventBus | undefined> {
  const bus = shallowRef<FeatureEventBus>()
  watchEffect(() => {
    bus.value = props.eventBus ?? props.getGlobalBus?.()
  })
  return bus
}

/**
 * Launch-frozen hostContext, then live updates from the bus.
 * Prop updates are ignored after the first launch snapshot.
 */
function useLiveHostContext<THostContext>(
  launchHostContext: ShallowRef<THostContext | undefined>,
  bus: ShallowRef<FeatureEventBus | undefined>,
  liveHostContextProp: () => THostContext | undefined,
  contextChangedEvent: string,
  cloneHostContext: (ctx: THostContext) => THostContext,
): ShallowRef<THostContext | undefined> {
  const hostContext = shallowRef<THostContext>()
  let launched = false
  let unsubscribe: (() => void) | undefined

  function apply(ctx: THostContext | undefined): void {
    if (ctx) hostContext.value = cloneHostContext(ctx)
  }

  watch(
    launchHostContext,
    (ctx) => {
      if (!ctx) return
      if (!launched) {
        launched = true
        apply(ctx)
      }
    },
    { immediate: true },
  )

  watch(
    liveHostContextProp,
    (ctx) => {
      if (!launched) apply(ctx)
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
        if (row.hostContext) apply(row.hostContext)
      }
      eventBus.on(contextChangedEvent, onContext)
      unsubscribe = () => eventBus.off(contextChangedEvent, onContext)
    },
    { immediate: true },
  )

  if (getCurrentScope()) onScopeDispose(() => unsubscribe?.())

  return hostContext
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
    options.cloneHostContext ?? cloneValue,
  )
  const { reportReady, reportError, reportDisposed } = useFeatureLifecycle(props, bus)

  function emitSignal(signal: string, detail?: Record<string, unknown>): void {
    const eventBus = bus.value
    const { instanceId, featureKey } = props
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
