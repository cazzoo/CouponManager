import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/setup.js'],
      include: ['src/**/*.{js,jsx}'],
      all: true,
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
})