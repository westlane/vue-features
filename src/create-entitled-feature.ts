import { defineAsyncComponent, defineComponent, h, type Component } from 'vue'

export type CreateEntitledFeatureOptions = {
  name?: string
  /** Dynamic import of the feature SFC (or any Vue component module). */
  loader: () => Promise<Component | { default: Component }>
  /** Delay before showing Vue's async loading state (ms). Default 0. */
  delay?: number
}

function resolveLoadedComponent(mod: Component | { default: Component }): Component {
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default
  }
  return mod as Component
}

/**
 * Controlled Vue loader for entitled product UI.
 * The dynamic `loader` runs only after the host mounts with `entitled === true`,
 * so unpaid / ungated users never download the feature chunk.
 */
export function createEntitledFeature(options: CreateEntitledFeatureOptions): Component {
  const AsyncFeature = defineAsyncComponent({
    loader: async () => resolveLoadedComponent(await options.loader()),
    delay: options.delay ?? 0,
    suspensible: false,
  })

  return defineComponent({
    name: options.name ?? 'EntitledFeature',
    inheritAttrs: false,
    props: {
      entitled: { type: Boolean, required: true },
    },
    setup(props, { attrs, slots }) {
      return () => (props.entitled ? h(AsyncFeature, attrs, slots) : null)
    },
  })
}
