import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "pnpm run build && pnpm run preview --ignore-lock",
    port: 4321,
    reuseExistingServer: true,
  },
});
