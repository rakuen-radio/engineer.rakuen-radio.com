import { defineConfig, type PluginOption } from "vite-plus";
import { oxContent } from "@ox-content/vite-plugin";
import { bareShell } from "./plugins/bare-shell";

const SITE_NAME = "エンジニアの楽園ラジオ";
const SITE_URL = "https://engineer.rakuen-radio.com";

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: "content",
      outDir: "dist",
      highlight: true,
      // NOTE: OG image generation is wired up (framework-less JSX template),
      // but upstream ox-content currently skips it when `ssg.bare` is set.
      ogImage: true,
      ogImageOptions: {
        template: "./og/template.tsx",
      },
      docs: { enabled: false },
      ssg: {
        bare: true,
        // Vite already empties `dist` at build start; ox-content's `clean`
        // would also wipe the copied `public/` assets, so keep it off.
        clean: false,
        siteName: SITE_NAME,
        siteUrl: SITE_URL,
        generateOgImage: true,
      },
      // Cast: comparing the plugin's vite types against vite-plus's
      // PluginOption overflows tsc's recursion limit (upstream friction).
    }) as unknown as PluginOption,
    bareShell({
      siteName: SITE_NAME,
      nav: [
        { href: "/episodes/", label: "エピソード" },
        { href: "/about/", label: "この番組について" },
      ],
      footer: `© 2026 ${SITE_NAME}`,
      stylesheets: ["/styles/tokens.css", "/styles/site.css"],
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      // Bare mode has no client JavaScript; Vite still needs an entry, so we
      // feed it a placeholder that the bare-shell plugin deletes afterwards.
      input: "empty-entry.js",
      output: {
        entryFileNames: "_empty.js",
      },
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
        command: "vp exec playwright test --update-snapshots",
        cache: false,
        dependsOn: ["build"],
      },
      deploy: {
        command: "vp exec wrangler deploy",
        cache: false,
        dependsOn: ["build"],
      },
    },
  },
});
