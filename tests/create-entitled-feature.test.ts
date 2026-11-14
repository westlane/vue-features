import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createEntitledFeature } from '../src/create-entitled-feature'

describe('createEntitledFeature', () => {
  it('does not invoke the loader until entitled', async () => {
    const loader = vi.fn(async () => ({
      default: defineComponent({
        name: 'HeavyFeature',
        setup: () => () => h('button', 'share'),
      }),
    }))

    const Feature = createEntitledFeature({
      name: 'TestShareFeature',
      loader,
    })

    const denied = mount(Feature, { props: { entitled: false } })
    await nextTick()
    expect(loader).not.toHaveBeenCalled()
    expect(denied.text()).toBe('')

    const entitled = mount(Feature, { props: { entitled: true } })
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loader).toHaveBeenCalledTimes(1)
    expect(entitled.text()).toBe('share')
  })

  it('forwards attrs to the loaded feature once entitled', async () => {
    const loader = vi.fn(async () => ({
      default: defineComponent({
        name: 'HeavyFeature',
        props: { label: { type: String, default: '' } },
        setup: (props) => () => h('span', props.label),
      }),
    }))

    const Feature = createEntitledFeature({
      name: 'TestShareFeature',
      loader,
    })

    const wrapper = mount(Feature, { props: { entitled: true, label: 'ok' } })
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loader).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toBe('ok')
  })
})
