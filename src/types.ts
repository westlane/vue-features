/**
 * Minimal host bus used by feature mounts.
 * Hosts may pass any event-emitter that matches this shape.
 */
export type FeatureEventBus = {
  on(eventName: string, listener: (payload: unknown) => void): void
  off(eventName: string, listener?: (payload: unknown) => void): void
  emit(eventName: string, payload?: Record<string, unknown>): boolean | void
}

/** Default lifecycle / chunk event names (override via options if needed). */
export const FeatureEvents = {
  chunkLoadStarted: 'feature.chunk.load-started',
  chunkLoaded: 'feature.chunk.loaded',
  chunkLoadFailed: 'feature.chunk.load-failed',
  widgetMounting: 'feature.widget.mounting',
  widgetReady: 'feature.widget.ready',
  widgetError: 'feature.widget.error',
  widgetUnmounting: 'feature.widget.unmounting',
  widgetDisposed: 'feature.widget.disposed',
  widgetSignal: 'feature.widget.signal',
  hostContextChanged: 'feature.host.context-changed',
} as const

export type FeatureWidgetErrorPhase = 'load' | 'mount' | 'runtime'

export type FeatureEntry = {
  mount: (el: HTMLElement, props: Record<string, unknown>) => void | Promise<void>
  unmount?: (el: HTMLElement) => void | Promise<void>
  update?: (el: HTMLElement, props: Record<string, unknown>) => void | Promise<void>
}

/** Billing / flag check shape — host injects Clerk, GrowthBook, etc. */
export type FeatureEntitlement = {
  feature?: string
  plan?: string
}

export type FeatureHas = (params: FeatureEntitlement) => boolean

export type FeatureRegistryRecord = {
  key: string
  /** Dynamic import that resolves to a Vue component, CE constructor, or FeatureEntry. */
  load: () => Promise<unknown>
  tag?: string
  /** Optional entitlement key checked by the host before load. */
  entitlementKey?: string
  entitlement?: FeatureEntitlement
}

/** Resolved host mount for a feature instance (CE or Vue). */
export type FeatureMount<THostContext = unknown> = {
  id: string
  featureKey: string
  tag: string
  spec: unknown
  hostContext: THostContext
}

export type FeatureInstanceState = 'mounting' | 'ready' | 'error' | 'unmounting' | 'disposed'
