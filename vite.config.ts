import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 650, // Bundle budget enforcement (FE-7.03)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-pdf')) {
              return 'vendor-pdf'
            }
            if (id.includes('@uiw/react-codemirror') || id.includes('@codemirror')) {
              return 'vendor-editor'
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase'
            }
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('@radix-ui')) {
              return 'vendor-ui'
            }
          }
        },
      },
    },
  },
})
