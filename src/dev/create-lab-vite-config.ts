import vue from '@vitejs/plugin-vue'
import { defineConfig, type UserConfig } from 'vite'

export type CreateFeatureLabViteConfigOptions = {
  root: string
  ceEntry: string
  ceAlias: string
  port: number
  aliases?: Record<string, string>
}

export function createFeatureLabViteConfig(
  options: CreateFeatureLabViteConfigOptions,
): UserConfig {
  const { root, ceEntry, ceAlias, port, aliases = {} } = options

  // Longer finds first so `@pkg/dev` wins over `@pkg` → file.
  const alias = [
    ...Object.entries(aliases)
      .map(([find, replacement]) => ({ find, replacement }))
      .sort((a, b) => b.find.length - a.find.length),
    { find: ceAlias, replacement: ceEntry },
  ]

  return defineConfig({
    root,
    plugins: [vue({ customElement: /\.ce\.vue$/ })],
    resolve: { alias },
    server: { port },
  })
}
