export type FeatureEventBus = {
  on(eventName: string, listener: (payload: unknown) => void): void
  off(eventName: string, listener?: (payload: unknown) => void): void
  emit(eventName: string, payload?: Record<string, unknown>): boolean | void
}

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

export type FeatureEntitlement = {
  feature?: string
  plan?: string
}

export type FeatureHas = (params: FeatureEntitlement) => boolean

export type FeatureRegistryRecord = {
  key: string
  load: () => Promise<unknown>
  tag?: string
  entitlement?: FeatureEntitlement
}

export type FeatureMount<THostContext = unknown> = {
  id: string
  featureKey: string
  tag: string
  spec: unknown
  hostContext: THostContext
}

export type FeatureInstanceState = 'mounting' | 'ready' | 'error' | 'unmounting' | 'disposed'
