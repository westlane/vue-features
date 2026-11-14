import { createApp, h, type Component } from 'vue'
import { DevFeatureHost } from './DevFeatureHost'

export type MountDevFeatureHostOptions = {
  tag: string
  featureKey: string
  instanceId: string
  spec: unknown
  hostContext: unknown
  title: string
  mountSelector?: string
  /** Optional controls rendered in the host panel. */
  controls?: Component
}

/** Register CE (once) and mount the generic feature lab host. */
export function mountDevFeatureHost(
  customElement: CustomElementConstructor | Component,
  options: MountDevFeatureHostOptions,
): void {
  if (!customElements.get(options.tag)) {
    customElements.define(options.tag, customElement as CustomElementConstructor)
  }

  const selector = options.mountSelector ?? '#app'
  const mountEl = document.querySelector(selector)
  if (!mountEl) {
    throw new Error(`Dev host mount target not found: ${selector}`)
  }

  const { controls, ...hostProps } = options
  createApp({
    render() {
      return h(
        DevFeatureHost,
        hostProps,
        controls
          ? { controls: (slotProps: Record<string, unknown>) => h(controls, slotProps) }
          : undefined,
      )
    },
  }).mount(mountEl)
}
