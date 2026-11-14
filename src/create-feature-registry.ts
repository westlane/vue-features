import type { FeatureRegistryRecord } from './types'

export type FeatureRegistry = {
  get(key: string): FeatureRegistryRecord | undefined
  has(key: string): boolean
  keys(): string[]
  register(record: FeatureRegistryRecord): void
  list(): FeatureRegistryRecord[]
}

/**
 * Allowlisted feature registry for host and generative UI mounts.
 * Unknown keys must not load.
 */
export function createFeatureRegistry(
  initial: readonly FeatureRegistryRecord[] = [],
): FeatureRegistry {
  const byKey = new Map<string, FeatureRegistryRecord>()

  for (const record of initial) {
    if (!record.key) throw new Error('FeatureRegistryRecord requires key')
    if (typeof record.load !== 'function') {
      throw new Error(`FeatureRegistryRecord "${record.key}" requires load()`)
    }
    byKey.set(record.key, record)
  }

  return {
    get(key) {
      return byKey.get(key)
    },
    has(key) {
      return byKey.has(key)
    },
    keys() {
      return [...byKey.keys()]
    },
    register(record) {
      if (!record.key) throw new Error('FeatureRegistryRecord requires key')
      if (typeof record.load !== 'function') {
        throw new Error(`FeatureRegistryRecord "${record.key}" requires load()`)
      }
      byKey.set(record.key, record)
    },
    list() {
      return [...byKey.values()]
    },
  }
}
