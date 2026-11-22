import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { useFeatureEntitled } from '../src/use-feature-entitled'

describe('useFeatureEntitled', () => {
  it('reflects entitlement against a reactive has()', () => {
    const entitled = ref(false)
    const has = computed(() => (params: { feature?: string }) => {
      if (!entitled.value) return false
      return params.feature === 'share'
    })

    const result = useFeatureEntitled({ feature: 'share' }, has)

    expect(result.value).toBe(false)
    entitled.value = true
    expect(result.value).toBe(true)
  })

  it('is false when has() is undefined', () => {
    const result = useFeatureEntitled({ feature: 'x' }, undefined)
    expect(result.value).toBe(false)
  })
})