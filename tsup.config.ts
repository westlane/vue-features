import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'dev/index': 'src/dev/index.ts',
    'lab-vite': 'src/vite.ts',
  },
  format: ['esm'],
  target: 'es2022',
  dts: true,
  sourcemap: false,
  minify: true,
  treeshake: true,
  clean: true,
  splitting: true,
  external: ['vue', 'vite', '@vitejs/plugin-vue'],
})
