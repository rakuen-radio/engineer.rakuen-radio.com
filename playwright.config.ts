import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression testing over the built static site.
 *
 * `vp run vrt` builds first (task dependency), then Playwright serves
 * `dist/` via `vp preview` and compares full-page screenshots against
 * the committed baselines in `tests/vrt/__screenshots__/`.
 * Baselines are platform-suffixed; CI (Linux) baselines are the source
 * of truth and are regenerated with `vp run vrt-update`.
 */
export default defineConfig({
  testDir: "tests/vrt",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{projectName}-{platform}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: "http://localhost:4173",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: {
    command: "vp preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
