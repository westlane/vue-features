import { describe, expect, it } from 'vitest'
import { createFeatureLabViteConfig } from '../src/dev/create-lab-vite-config'

describe('createFeatureLabViteConfig', () => {
  it('orders longer package subpath aliases before the package root', () => {
    const config = createFeatureLabViteConfig({
      root: '/tmp/lab',
      ceEntry: '/tmp/lab/ce.ts',
      ceAlias: '@fieldwise/feature-chart/ce',
      port: 5182,
      aliases: {
        '@westlane/vue-features': '/tmp/vue-features/index.ts',
        '@westlane/vue-features/dev': '/tmp/vue-features/dev/index.ts',
      },
    })

    const alias = config.resolve?.alias
    expect(Array.isArray(alias)).toBe(true)
    if (!Array.isArray(alias)) return

    const finds = alias.map((row) => ('find' in row ? String(row.find) : ''))
    const rootIdx = finds.indexOf('@westlane/vue-features')
    const devIdx = finds.indexOf('@westlane/vue-features/dev')
    expect(devIdx).toBeGreaterThanOrEqual(0)
    expect(rootIdx).toBeGreaterThanOrEqual(0)
    expect(devIdx).toBeLessThan(rootIdx)
  })
})
