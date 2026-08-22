import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite-plus";
import { oxContent } from "@ox-content/vite-plugin";
import { bareShell } from "./plugins/bare-shell";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: "content",
      outDir: "dist",
      highlight: true,
      // NOTE: OG image generation is wired up (framework-less JSX template),
      // but ox-content skips it while `ssg.bare` is set:
      // https://github.com/ubugeeei-prod/ox-content/issues/602
      ogImage: true,
      ogImageOptions: {
        template: "./og/template.tsx",
      },
      docs: { enabled: false },
      ssg: {
        bare: true,
        // Vite already empties `dist` at build start; ox-content's `clean`
        // would also wipe the emitted stylesheet, so keep it off.
        clean: false,
        siteUrl: pkg.homepage,
        generateOgImage: true,
      },
    }),
    bareShell(),
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
