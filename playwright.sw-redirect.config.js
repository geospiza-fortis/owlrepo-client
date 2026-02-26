import { defineConfig } from "@playwright/test";

// Separate config for testing the full service worker 302 → GCS caching flow.
// Builds WITHOUT TAURI_MODE so API endpoints issue 302 redirects to GCS.
// Uses --disable-web-security to bypass CORS (GCS only allows production domain).
// Run with: npx playwright test --config playwright.sw-redirect.config.js

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3002",
    serviceWorkers: "allow",
    launchOptions: {
      args: ["--disable-web-security"],
    },
  },
  projects: [
    {
      name: "sw-redirect",
      use: { browserName: "chromium" },
      testMatch: /service-worker-redirect\.spec/,
    },
  ],
  webServer: {
    command:
      "cross-env MODE=staging PORT=3002 vite build && cross-env PORT=3002 node build",
    url: "http://localhost:3002",
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
