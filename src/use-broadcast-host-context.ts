import { watch, type Ref } from 'vue'
import { FeatureEvents, type FeatureEventBus } from './types'

function defaultClone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export type UseBroadcastHostContextOptions<THostContext> = {
  event?: string
  clone?: (ctx: THostContext) => THostContext
  /** Extra payload fields (e.g. Fieldwise `lockerSlug`). */
  extra?: (ctx: THostContext) => Record<string, unknown>
}

/** Host-side: push live host context onto the feature bus. */
export function useBroadcastHostContext<THostContext>(
  hostContext: Ref<THostContext | null | undefined>,
  bus: FeatureEventBus,
  options: UseBroadcastHostContextOptions<THostContext> = {},
): void {
  const event = options.event ?? FeatureEvents.hostContextChanged
  const clone = options.clone ?? defaultClone

  watch(
    hostContext,
    (ctx) => {
      if (ctx == null) return
      const next = clone(ctx)
      bus.emit(event, {
        hostContext: next,
        ...options.extra?.(next),
      })
    },
    { deep: true, immediate: true },
  )
}
