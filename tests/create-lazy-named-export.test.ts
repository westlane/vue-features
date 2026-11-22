import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createLazyNamedExport } from '../src/create-lazy-named-export'

describe('createLazyNamedExport', () => {
  it('async-loads a named export from a dynamic import module', async () => {
    const Inner = defineComponent({
      name: 'InnerFeature',
      setup: () => () => h('span', 'loaded'),
    })
    const loader = vi.fn(async () => ({ ChartFeature: Inner }))

    const Lazy = createLazyNamedExport(loader, 'ChartFeature')
    const wrapper = mount(defineComponent({
      components: { Lazy },
      template: '<Suspense><Lazy /></Suspense>',
    }))
    await flushPromises()

    expect(loader).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toBe('loaded')
  })
})