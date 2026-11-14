import { reactive } from 'vue'
import { FeatureEvents, type FeatureEventBus } from '../types'

type Handler = (data: unknown) => void

export type DevFeatureEventBus = FeatureEventBus & {
  emitHostContextChanged(hostContext: unknown): void
  signalLog: Array<Record<string, unknown>>
}

export function createDevFeatureEventBus(): DevFeatureEventBus {
  const handlers = new Map<string, Set<Handler>>()
  const signalLog = reactive<Array<Record<string, unknown>>>([])

  const bus: DevFeatureEventBus = {
    signalLog,
    on(eventName, listener) {
      const set = handlers.get(eventName) ?? new Set()
      set.add(listener as Handler)
      handlers.set(eventName, set)
    },
    off(eventName, listener) {
      const set = handlers.get(eventName)
      if (!set) return
      if (listener) set.delete(listener as Handler)
      else handlers.delete(eventName)
    },
    emit(eventName, data = {}) {
      const payload = {
        event: eventName,
        timestamp: Date.now(),
        success: true,
        ...data,
      }
      if (eventName === FeatureEvents.widgetSignal) {
        signalLog.unshift(payload)
        if (signalLog.length > 20) signalLog.pop()
      }
      handlers.get(eventName)?.forEach((listener) => listener(payload))
      return true
    },
    emitHostContextChanged(hostContext) {
      bus.emit(FeatureEvents.hostContextChanged, { hostContext })
    },
  }

  return bus
}
