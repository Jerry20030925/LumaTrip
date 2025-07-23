import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents() {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    env: {
      // 测试环境变量
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'TestPassword123!',
      API_BASE_URL: 'http://localhost:5173/api'
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html'
  },
  retries: {
    runMode: 2,
    openMode: 0
  },
  watchForFileChanges: false,
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  blockHosts: [
    '*.google-analytics.com',
    '*.googletagmanager.com',
    '*.facebook.com',
    '*.twitter.com'
  ]
});