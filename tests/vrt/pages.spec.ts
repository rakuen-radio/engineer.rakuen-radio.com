import { test, expect } from "@playwright/test";

/**
 * Full-page visual regression for every static page.
 * Add an entry here whenever a page is added under `content/`.
 */
const pages = [
  { path: "/", name: "home" },
  { path: "/about/", name: "about" },
  { path: "/episodes/", name: "episodes-index" },
  { path: "/episodes/001/", name: "episode-001" },
  { path: "/404.html", name: "not-found" },
];

for (const { path, name } of pages) {
  test(`${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
