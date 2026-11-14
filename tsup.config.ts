import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'dev/index': 'src/dev/index.ts',
    'lab-vite': 'src/vite.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['vue', 'vite', '@vitejs/plugin-vue'],
})
