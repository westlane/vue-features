import { defineAsyncComponent, defineComponent, h, type Component } from 'vue'

export type CreateEntitledFeatureOptions = {
  name?: string
  loader: () => Promise<Component | { default: Component }>
  delay?: number
}

function resolveLoadedComponent(mod: Component | { default: Component }): Component {
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default
  }
  return mod as Component
}

/** Lazy-load a Vue feature only while `entitled` is true. */
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
