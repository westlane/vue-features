import { shallowRef, watch, type ShallowRef } from 'vue'
import { cloneValue } from './clone-value'

/** Capture launch props once; ignore later host updates. */
export function useLaunchOnce<THostContext = unknown>(props: {
  spec?: unknown
  hostContext?: THostContext
}): {
  spec: ShallowRef<unknown | undefined>
  hostContext: ShallowRef<THostContext | undefined>
} {
  const spec = shallowRef<unknown>()
  const hostContext = shallowRef<THostContext>()
  let captured = false
  const waitsForHostContext = 'hostContext' in props

  watch(
    () => [props.spec, props.hostContext] as const,
    () => {
      if (captured) return
      if (props.spec === undefined) return
      if (waitsForHostContext && props.hostContext === undefined) return

      spec.value = cloneValue(props.spec)
      if (props.hostContext !== undefined) {
        hostContext.value = cloneValue(props.hostContext)
      }
      captured = true
    },
    { immediate: true },
  )

  return { spec, hostContext }
}
