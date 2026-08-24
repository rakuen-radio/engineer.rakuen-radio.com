import { defineConfig } from "vite-plus";
import { defaultTheme, defineTheme, oxContent } from "@ox-content/vite-plugin";
import { staticOutput } from "./plugins/static-output";
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
        // Explicit empty navigation instead of the derived file tree, which
        // would list the 404 page in the sidebar.
        navigation: [],
        // The stock theme, on purpose: this repo is a foundation, so the
        // design should not make statements the real site will have to undo.
        theme: defineTheme({
          extends: defaultTheme,
          footer: {
            copyright: `© 2026 ${SITE_NAME}`,
          },
          // No sidebar (navigation is empty), so don't reserve its column.
          layout: {
            sidebarWidth: "0px",
          },
          // The theme renders its search UI even with `search: false` (no
          // index is built, so the buttons would open a dead modal), and the
          // mobile menu button opens the empty navigation drawer.
          css: `
            .search-button,
            .mobile-footer-btn[data-mobile-search],
            .mobile-footer-btn[data-mobile-menu] {
              display: none;
            }
          `,
        }),
      },
    }),
    staticOutput(),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      // The theme carries its own assets; Vite still needs an entry, so we
      // feed it a placeholder that staticOutput deletes afterwards.
      input: "empty-entry.js",
      output: {
        entryFileNames: "_empty.js",
      },
    },
  },
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
        command: "vp preview --port 4173 --strictPort",
        cache: false,
        dependsOn: ["build"],
      },
      vrt: {
        command: "vp exec playwright test",
        cache: false,
        dependsOn: ["build"],
      },
      "vrt-update": {
        command: "vp exec playwright test --update-snapshots=all",
        cache: false,
        dependsOn: ["build"],
      },
      "vrt-commit": {
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
