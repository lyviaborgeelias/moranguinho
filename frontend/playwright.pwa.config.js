import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-pwa",
  timeout: 90000,
  expect: { timeout: 15000 },
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1024, height: 768 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "python -B ../backend/e2e_server.py",
      url: "http://127.0.0.1:8011/api/health/",
      timeout: 30000,
    },
    {
      command: "npm run preview -- --host 127.0.0.1",
      url: "http://127.0.0.1:4173",
      env: { API_PROXY_TARGET: "http://127.0.0.1:8011" },
      timeout: 30000,
    },
  ],
});
