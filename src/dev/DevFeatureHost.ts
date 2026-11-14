import { computed, defineComponent, h, shallowRef, type PropType } from 'vue'
import { cloneValue } from '../clone-value'
import { createDevFeatureEventBus } from './create-dev-event-bus'

export const DevFeatureHost = defineComponent({
  name: 'DevFeatureHost',
  props: {
    tag: { type: String, required: true },
    featureKey: { type: String, required: true },
    instanceId: { type: String, required: true },
    spec: { type: null as unknown as PropType<unknown>, required: true },
    hostContext: { type: null as unknown as PropType<unknown>, required: true },
    title: { type: String, required: true },
  },
  setup(props, { slots }) {
    const launchSpec = shallowRef(cloneValue(props.spec))
    const liveHostContext = shallowRef(cloneValue(props.hostContext))
    const bus = createDevFeatureEventBus()

    const signalLines = computed(() =>
      bus.signalLog.map((entry) => {
        const signal = String(entry.signal ?? '')
        const featureKey = String(entry.featureKey ?? '')
        return `${signal} · ${featureKey} · ${JSON.stringify(entry.detail ?? {})}`
      }),
    )

    function setHostContext(next: unknown): void {
      liveHostContext.value = cloneValue(next)
      bus.emitHostContextChanged(liveHostContext.value)
    }

    return () =>
      h('div', { class: 'vf-lab' }, [
        h('header', { class: 'vf-lab__header' }, [
          h('h1', { class: 'vf-lab__title' }, props.title),
          h('p', { class: 'vf-lab__hint' }, 'Standalone feature lab'),
        ]),
        h('div', { class: 'vf-lab__layout' }, [
          h('section', { class: 'vf-lab__panel', 'aria-label': 'Host controls' }, [
            h('h2', { class: 'vf-lab__panel-title' }, 'Host'),
            slots.controls?.({
              hostContext: liveHostContext.value,
              setHostContext,
              bus,
            }),
            h('h3', { class: 'vf-lab__subhead' }, 'Signals'),
            signalLines.value.length
              ? h(
                  'ul',
                  { class: 'vf-lab__log' },
                  signalLines.value.map((line) => h('li', line)),
                )
              : h('p', { class: 'vf-lab__empty' }, 'No feature.widget.signal yet.'),
          ]),
          h('section', { class: 'vf-lab__widget', 'aria-label': 'Feature widget' }, [
            h(props.tag, {
              spec: launchSpec.value,
              hostContext: liveHostContext.value,
              eventBus: bus,
              instanceId: props.instanceId,
              featureKey: props.featureKey,
              tag: props.tag,
            }),
          ]),
        ]),
      ])
  },
})
