import { test, expect } from "@playwright/test";

/**
 * Full-page visual regression. The site is a single page plus the error
 * page Cloudflare serves for unknown URLs.
 */
const pages = [
  { path: "/", name: "home" },
  { path: "/404.html", name: "not-found" },
];

for (const { path, name } of pages) {
  test(`${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
