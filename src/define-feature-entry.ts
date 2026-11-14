import type { FeatureEntry } from './types'

export type DefineFeatureEntryOptions = FeatureEntry

/**
 * Declare an imperative feature entry (mount / unmount / optional update).
 * Useful for generative UI hosts and non-CE mounts.
 */
export function defineFeatureEntry(options: DefineFeatureEntryOptions): FeatureEntry {
  if (typeof options.mount !== 'function') {
    throw new Error('defineFeatureEntry requires a mount(el, props) function')
  }
  return {
    mount: options.mount,
    unmount: options.unmount,
    update: options.update,
  }
}
