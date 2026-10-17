// @ts-check
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 10000,
  // the tests share one database, so they must run one at a time
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Playwright starts the system under test: the backend in test mode
  // (which uses the separate test database) and the frontend dev server.
  webServer: [
    {
      command: 'npm run start:test',
      cwd: '../../part4/bloglist',
      url: 'http://localhost:3003/api/blogs',
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      cwd: '../bloglist-frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
})
