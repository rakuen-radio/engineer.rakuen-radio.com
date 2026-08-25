import { defineConfig } from "vite-plus";
import { defaultTheme, defineTheme, oxContent } from "@ox-content/vite-plugin";
import pkg from "./package.json" with { type: "json" };

const SITE_NAME = "エンジニアの楽園ラジオ";

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: "content",
      outDir: "dist",
      highlight: true,
      ogImage: true,
      ogImageOptions: {
        template: "./og/template.ts",
      },
      docs: { enabled: false },
      // One page, no search UI: the index would just be dead weight.
      search: false,
      // Single locale; this is what gives the themed pages `<html lang="ja">`.
      i18n: { enabled: true, defaultLocale: "ja" },
      ssg: {
        siteName: SITE_NAME,
        siteUrl: pkg.homepage,
        generateOgImage: true,
        // content/404.md -> dist/404.html, where Cloudflare's
        // `not_found_handling: "404-page"` looks for it.
        notFound: true,
        // Honor per-page frontmatter chrome flags (index.md hides the
        // sidebar; the site is a single page).
        pageChrome: true,
        // The stock theme, on purpose: this repo is a foundation, so the
        // design should not make statements the real site will have to undo.
        theme: defineTheme({
          extends: defaultTheme,
          footer: {
            copyright: `© 2026 ${SITE_NAME}`,
          },
          // `sidebar: false` removes the sidebar element but the layout
          // still reserves its column; collapse it.
          layout: {
            sidebarWidth: "0px",
          },
          // The theme renders its search UI even with `search: false` (no
          // index is built, so the buttons would open a dead modal), the
          // mobile menu button opens the empty navigation drawer, and the
          // header falls back to /logo.svg even when no logo is configured —
          // this site has no logo yet, so hide the slot.
          css: `
            .search-button,
            .mobile-footer-btn[data-mobile-search],
            .mobile-footer-btn[data-mobile-menu],
            .header-logo {
              display: none;
            }
          `,
        }),
      },
    }),
  ],
  run: {
    tasks: {
      dev: {
        command: "vp dev",
        cache: false,
      },
      build: {
        command: "vp build",
      },
      preview: {
        command: "vp preview --port 4517 --strictPort",
        cache: false,
        dependsOn: ["build"],
      },
      vrt: {
        command: "vp exec playwright test",
        cache: false,
        dependsOn: ["build"],
      },
      "vrt:update": {
        command: "vp exec playwright test --update-snapshots=all",
        cache: false,
        dependsOn: ["build"],
      },
      "vrt:commit": {
        command: "vp exec node scripts/commit-vrt-snapshots.ts",
        cache: false,
      },
      deploy: {
        command: "vp exec wrangler deploy",
        cache: false,
        dependsOn: ["build"],
      },
    },
  },
});
