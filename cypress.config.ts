import { defineConfig } from 'cypress'
import { devServer } from '@cypress/vite-dev-server'
import react from '@vitejs/plugin-react'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config)
      return config
    },
    baseUrl: 'http://localhost:3009',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: (config) => {
      return devServer({
        ...config,
        framework: 'react',
        indexHtmlFile: 'cypress/support/component-index.html',
        viteConfig: {
          plugins: [react()],
        },
      })
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
})
