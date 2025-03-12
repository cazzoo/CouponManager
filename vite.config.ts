import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000
    },
    define: {
      // Make env variables available to the client side code
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    // Environment variables with VITE_ prefix are automatically
    // exposed to client side code via import.meta.env
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        }
      }
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    }
  }
}) 