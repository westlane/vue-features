import { filterEntitledFeatures } from './filter-entitled-features'
import {
  FeatureEvents,
  type FeatureEntitlement,
  type FeatureEventBus,
  type FeatureHas,
} from './types'

export type FeatureCustomElementEntry = {
  key: string
  tag: string
  load: () => Promise<{ default: CustomElementConstructor }>
  entitlement?: FeatureEntitlement
}

export type RegisterFeatureElementOptions = {
  events?: {
    loadStarted?: string
    loaded?: string
    loadFailed?: string
  }
}

export async function registerFeatureElement(
  entry: FeatureCustomElementEntry,
  bus: FeatureEventBus,
  options: RegisterFeatureElementOptions = {},
): Promise<void> {
  if (typeof customElements !== 'undefined' && customElements.get(entry.tag)) return

  const events = {
    loadStarted: options.events?.loadStarted ?? FeatureEvents.chunkLoadStarted,
    loaded: options.events?.loaded ?? FeatureEvents.chunkLoaded,
    loadFailed: options.events?.loadFailed ?? FeatureEvents.chunkLoadFailed,
  }

  bus.emit(events.loadStarted, {
    featureKey: entry.key,
    tag: entry.tag,
  })

  try {
    const mod = await entry.load()
    customElements.define(entry.tag, mod.default)
    bus.emit(events.loaded, {
      featureKey: entry.key,
      tag: entry.tag,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    bus.emit(events.loadFailed, {
      featureKey: entry.key,
      tag: entry.tag,
      error: message,
      success: false,
    })
    throw err
  }
}

export async function loadFeatureElements(
  entries: readonly FeatureCustomElementEntry[],
  bus: FeatureEventBus,
  options?: RegisterFeatureElementOptions,
): Promise<void> {
  await Promise.all(entries.map((entry) => registerFeatureElement(entry, bus, options)))
}

export async function loadEntitledFeatures<
  T extends FeatureCustomElementEntry & { entitlement: FeatureEntitlement },
>(
  registry: readonly T[],
  has: FeatureHas | undefined,
  bus: FeatureEventBus,
  options?: RegisterFeatureElementOptions,
): Promise<T[]> {
  const entitled = filterEntitledFeatures(registry, has)
  await loadFeatureElements(entitled, bus, options)
  return entitled
}
