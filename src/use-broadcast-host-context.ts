import { watch, type Ref } from 'vue'
import { cloneValue } from './clone-value'
import { FeatureEvents, type FeatureEventBus } from './types'

export type UseBroadcastHostContextOptions<THostContext> = {
  event?: string
  clone?: (ctx: THostContext) => THostContext
  extra?: (ctx: THostContext) => Record<string, unknown>
}

/** Push live host context onto the feature bus. */
export function useBroadcastHostContext<THostContext>(
  hostContext: Ref<THostContext | null | undefined>,
  bus: FeatureEventBus,
  options: UseBroadcastHostContextOptions<THostContext> = {},
): void {
  const event = options.event ?? FeatureEvents.hostContextChanged
  const clone = options.clone ?? cloneValue

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
