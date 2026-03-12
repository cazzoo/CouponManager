import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import istanbul from 'vite-plugin-istanbul'

const useCoverage = process.env.CYPRESS_COVERAGE === 'true'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      useCoverage && istanbul({
        cypress: true,
        requireEnv: false,
        forceBuildInstrument: true,
      }),
    ].filter(Boolean),
    server: {
      port: 3009,
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
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{js,jsx,ts,tsx}',
          '**/*.config.{js,ts}',
          'src/types/',
          'src/vite-env.d.ts',
          'dist/',
          'build/',
          'coverage/',
          'scripts/',
          'migrations/',
          'public/'
        ],
        all: true,
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
