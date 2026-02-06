import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      port: 3000,
      fs: {
        strict: true,
        allow: ['src', 'public', 'node_modules']
      },
      watch: {
        ignored: ['**/pocketbase/**', '**/pb_data/**', '**/pb_migrations/**', 'pocketbase']
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8090',
          changeOrigin: true,
          secure: false
        }
      }
    },
    optimizeDeps: {
      exclude: ['pocketbase']
    },
    define: {
      // Make env variables available to client side code
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    // Environment variables with VITE_ prefix are automatically
    // exposed to client side code via import.meta.env
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        external: ['pocketbase']
      }
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: true
    }
  }
})
