import type { FeatureEventBus } from '../src/types'

export function createTestBus(): FeatureEventBus & {
  log: { event: string; payload: unknown }[]
} {
  const handlers = new Map<string, Set<(data: unknown) => void>>()
  const log: { event: string; payload: unknown }[] = []
  return {
    log,
    on(eventName, listener) {
      const set = handlers.get(eventName) ?? new Set()
      set.add(listener as (data: unknown) => void)
      handlers.set(eventName, set)
    },
    off(eventName, listener) {
      const set = handlers.get(eventName)
      if (!set) return
      if (listener) set.delete(listener as (data: unknown) => void)
      else handlers.delete(eventName)
    },
    emit(eventName, data = {}) {
      log.push({ event: eventName, payload: data })
      handlers.get(eventName)?.forEach((listener) => listener({ ...data }))
      return true
    },
  }
}
