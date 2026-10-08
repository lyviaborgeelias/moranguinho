import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  expect: { timeout: 10000 },
  workers: 1,
  use: {
    actionTimeout: 10000,
    baseURL: "http://127.0.0.1:5180",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1050 } },
    },
  ],
  webServer: [
    {
      command: "python -B ../backend/e2e_server.py",
      url: "http://127.0.0.1:8011/api/health/",
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: "npm run dev -- --port 5180 --host 127.0.0.1",
      url: "http://127.0.0.1:5180",
      env: { API_PROXY_TARGET: "http://127.0.0.1:8011" },
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
