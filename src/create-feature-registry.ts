import type { FeatureRegistryRecord } from './types'

export type FeatureRegistry = {
  get(key: string): FeatureRegistryRecord | undefined
  has(key: string): boolean
  keys(): string[]
  register(record: FeatureRegistryRecord): void
  list(): FeatureRegistryRecord[]
}

function assertRecord(record: FeatureRegistryRecord): void {
  if (!record.key) throw new Error('FeatureRegistryRecord requires key')
  if (typeof record.load !== 'function') {
    throw new Error(`FeatureRegistryRecord "${record.key}" requires load()`)
  }
}

/** Allowlisted feature registry — unknown keys must not load. */
export function createFeatureRegistry(
  initial: readonly FeatureRegistryRecord[] = [],
): FeatureRegistry {
  const byKey = new Map<string, FeatureRegistryRecord>()

  for (const record of initial) {
    assertRecord(record)
    byKey.set(record.key, record)
  }

  return {
    get: (key) => byKey.get(key),
    has: (key) => byKey.has(key),
    keys: () => [...byKey.keys()],
    register(record) {
      assertRecord(record)
      byKey.set(record.key, record)
    },
    list: () => [...byKey.values()],
  }
}
