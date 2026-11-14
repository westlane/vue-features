import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root,
  plugins: [vue(), tailwindcss()],
  server: { port: 5190, strictPort: true },
})
