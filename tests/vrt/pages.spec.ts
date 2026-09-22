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
    await page.locator("img").evaluateAll((images) =>
      Promise.all(images.map((image) => image.decode().catch(() => undefined))),
    );
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}

test("home header appears after the title scrolls away", async ({ page }) => {
  await page.goto("/");
  const header = page.locator(".header");
  const title = page.locator(".program-title");

  await expect(header).not.toHaveClass(/is-visible/);
  await title.evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().bottom + window.scrollY + 1);
  });
  await expect(header).toHaveClass(/is-visible/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveClass(/is-visible/);
});
