import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4322",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // --ignore-lock keeps the server in the foreground: when Astro detects an
    // AI agent it otherwise starts it in the background and exits at once,
    // which Playwright reads as the server dying.
    command: "pnpm exec astro preview --port 4322 --ignore-lock",
    url: "http://localhost:4322",
    reuseExistingServer: !process.env["CI"],
  },
});
