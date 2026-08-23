import { readFileSync } from "node:fs";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite-plus";
import { createTheme, oxContent } from "@ox-content/vite-plugin";
import { siteLayout } from "./theme/layout";
import { staticOutput, stylesheetHref } from "./plugins/static-output";
import { parse } from "yaml";
import pkg from "./package.json" with { type: "json" };

// The site is one page, so that page's frontmatter is where the site name
// lives; nothing is repeated here.
const home = readFileSync("content/index.md", "utf-8");
const { title } = parse(
  home.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "",
) as { title: string };

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
      ssg: {
        render: createTheme({
          layouts: {
            default: siteLayout({
              siteUrl: pkg.homepage,
              stylesheet: stylesheetHref,
            }),
          },
        }),
        // Vite already empties `dist` at build start; ox-content's `clean`
        // would also wipe the emitted stylesheet, so keep it off.
        clean: false,
        siteName: title,
        siteUrl: pkg.homepage,
        generateOgImage: true,
      },
    }),
    staticOutput(),
  ],
  css: {
    transformer: "lightningcss",
    lightningcss: {
      // `browserslist()` reads the `browserslist` field in package.json.
      targets: browserslistToTargets(browserslist()),
    },
  },
  build: {
    outDir: "dist",
    cssMinify: "lightningcss",
    rollupOptions: {
      // The site ships zero JavaScript, so the stylesheet is the only entry.
      input: "styles/site.css",
    },
  },
  run: {
    tasks: {
      tokens: {
        command:
          "vp exec style-dictionary build --config style-dictionary.config.js",
      },
      dev: {
        command: "vp dev",
        cache: false,
        dependsOn: ["tokens"],
      },
      build: {
        command: "vp build",
        dependsOn: ["tokens"],
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
