import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': path.resolve(__dirname, './src/main'),
      },
    },
  },
  renderer: {
    entry: 'src/renderer/index.tsx',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/renderer'),
      },
    },
    plugins: [react()],
  },
})
