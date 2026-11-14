import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { useLaunchOnce } from '../src/use-launch-once'

describe('useLaunchOnce', () => {
  it('freezes spec after first capture', async () => {
    const props = reactive<{ spec?: { n: number }; hostContext?: { id: string } }>({
      spec: { n: 1 },
      hostContext: { id: 'a' },
    })

    const Comp = defineComponent({
      setup() {
        const launch = useLaunchOnce(props)
        return () =>
          h('div', {
            'data-n': String((launch.spec.value as { n: number } | undefined)?.n ?? ''),
            'data-id': String((launch.hostContext.value as { id: string } | undefined)?.id ?? ''),
          })
      },
    })

    const wrapper = mount(Comp)
    await nextTick()
    expect(wrapper.attributes('data-n')).toBe('1')
    expect(wrapper.attributes('data-id')).toBe('a')

    props.spec = { n: 99 }
    props.hostContext = { id: 'z' }
    await nextTick()
    expect(wrapper.attributes('data-n')).toBe('1')
    expect(wrapper.attributes('data-id')).toBe('a')
  })
})
