import type { FeatureMount } from './types'

export type FeatureMountEntry = {
  key: string
  tag: string
  parseParams: (raw: unknown) => unknown
}

export type FeatureInstance = {
  id: string
  featureKey: string
  params: unknown
}

export function findFeatureEntry<T extends { key: string }>(
  registry: readonly T[],
  featureKey: string,
): T | undefined {
  return registry.find((entry) => entry.key === featureKey)
}

export function resolveFeatureMount<THostContext>(
  entry: FeatureMountEntry,
  instance: FeatureInstance,
  hostContext: THostContext,
): FeatureMount<THostContext> {
  if (instance.featureKey !== entry.key) {
    throw new Error(
      `Feature instance ${instance.id} does not match registry key ${entry.key}`,
    )
  }

  return {
    id: instance.id,
    featureKey: instance.featureKey,
    tag: entry.tag,
    spec: entry.parseParams(instance.params),
    hostContext,
  }
}
