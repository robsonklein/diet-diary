import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 7"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: "node tests/fixtures/directus.mjs",
          url: "http://127.0.0.1:8056",
          reuseExistingServer: false,
        },
        {
          command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
          url: "http://127.0.0.1:3100",
          reuseExistingServer: false,
          timeout: 120000,
          env: {
            CATALOG_SOURCE: "directus",
            NEXT_PUBLIC_DIRECTUS_URL: "http://127.0.0.1:8056",
            DIRECTUS_READ_TOKEN: "test-read-token",
          },
        },
      ],
});
