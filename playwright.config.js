import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: process.env.PW_DEV
      ? "npx cross-env MODE=staging VITE_TAURI=true vite dev --port 3000"
      : "cross-env MODE=staging VITE_TAURI=true vite build && node build",
    url: "http://localhost:3000",
    timeout: process.env.PW_DEV ? 30_000 : 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
