import { defineAsyncComponent, type Component } from 'vue'

/** Lazy `defineAsyncComponent` for a named export — keeps host chunks from static feature imports. */
export function createLazyNamedExport<
  TModule extends Record<string, unknown>,
  TName extends keyof TModule & string,
>(
  loader: () => Promise<TModule>,
  exportName: TName,
): Component {
  return defineAsyncComponent(() => loader().then((mod) => mod[exportName] as Component))
}