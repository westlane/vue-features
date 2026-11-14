import vue from '@vitejs/plugin-vue'
import { defineConfig, type UserConfig } from 'vite'

export type CreateFeatureLabViteConfigOptions = {
  /** Absolute path to the feature `dev/` folder (Vite root). */
  root: string
  /** Absolute path to the CE entry (`…/src/index.ce.ts`). */
  ceEntry: string
  /** Alias that resolves to the CE entry. */
  ceAlias: string
  port: number
  /** Extra resolve aliases (contract, package source maps, etc.). */
  aliases?: Record<string, string>
}

/** Shared Vite config for standalone feature CE labs. */
export function createFeatureLabViteConfig(
  options: CreateFeatureLabViteConfigOptions,
): UserConfig {
  const { root, ceEntry, ceAlias, port, aliases = {} } = options

  return defineConfig({
    root,
    plugins: [vue({ customElement: /\.ce\.vue$/ })],
    resolve: {
      alias: {
        ...aliases,
        [ceAlias]: ceEntry,
      },
    },
    server: { port },
  })
}
