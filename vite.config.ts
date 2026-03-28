import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('react-syntax-highlighter')) {
            return 'syntax-highlighter'
          }

          if (id.includes('framer-motion')) {
            return 'motion-stack'
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-stack'
          }
        },
      },
    },
  },
})
