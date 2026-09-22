import { defineConfig } from "vite-plus";
import voltageColors from "@ox-content/theme-color-voltage";
import voltage from "@ox-content/theme-voltage";
import { defineTheme, oxContent } from "@ox-content/vite-plugin";
import pkg from "./package.json" with { type: "json" };

const SITE_NAME = "Findy presents エンジニアの楽園ラジオ";
const DARK_COLORS = {
  ...voltageColors.darkColors,
  background: "#00001F",
};

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
        theme: [
          voltage,
          voltageColors,
          defineTheme({
            // Use the Voltage dark palette for every color-scheme state.
            colors: DARK_COLORS,
            darkColors: DARK_COLORS,
            tokens: voltageColors.darkTokens,
            darkTokens: voltageColors.darkTokens,
            footer: {
              copyright: "© Forcode Co., Ltd.",
            },
            // `sidebar: false` removes the sidebar element but the layout
            // still reserves its column; collapse it.
            layout: {
              sidebarWidth: "0px",
            },
            css: `
            .search-button,
            .theme-toggle,
            .mobile-footer {
              display: none;
            }

            .header {
              position: fixed;
              inset: 0 0 auto;
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              transform: translateY(-100%);
              transition:
                opacity var(--octc-motion-base) var(--octc-motion-ease),
                transform var(--octc-motion-base) var(--octc-motion-ease),
                visibility var(--octc-motion-base) step-end;
            }

            .header.is-visible {
              opacity: 1;
              visibility: visible;
              pointer-events: auto;
              transform: translateY(0);
              transition:
                opacity var(--octc-motion-base) var(--octc-motion-ease),
                transform var(--octc-motion-base) var(--octc-motion-ease),
                visibility 0s step-start;
            }

            @media (prefers-reduced-motion: reduce) {
              .header,
              .header.is-visible {
                transition: none;
              }
            }

            .header-logo {
              grid-column: 1;
              grid-row: 1 / 3;
              width: 2.25rem;
              height: 2.25rem;
              content: url("/assets/cover.png");
              object-fit: contain;
            }

            .header-title {
              display: grid;
              grid-template-columns: auto auto;
              grid-template-rows: auto auto;
              column-gap: 0.75rem;
              row-gap: 0;
              align-items: center;
              font-size: 0;
            }

            .header-title::before,
            .header-title::after {
              grid-column: 2;
              line-height: 1.15;
            }

            .header-title::before {
              content: "Findy presents";
              grid-row: 1;
              align-self: end;
              font-size: 0.8rem;
            }

            .header-title::after {
              content: "エンジニアの楽園ラジオ";
              grid-row: 2;
              align-self: start;
              font-size: 1rem;
            }

            :root {
              color-scheme: dark;
            }

            .radio-hero {
              display: grid;
              place-items: center;
              min-height: min(76svh, 52rem);
              margin-bottom: clamp(3rem, 10vw, 8rem);
            }

            .radio-hero img {
              width: min(100%, 34rem);
              margin: 0;
              border: 0;
              background: transparent;
              box-shadow: none;
            }

            .program-title span {
              display: block;
            }

            .program-title span:first-child {
              margin-bottom: 0.35em;
              font-size: 0.5em;
              line-height: 1;
            }

            .program-title span:last-child {
              font-size: 0.667em;
            }

            .platform-grid {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 1rem;
            }

            .platform-grid a {
              display: inline-flex;
              align-items: center;
              gap: 0.65rem;
            }

            .platform-grid img {
              width: 2.5rem;
              height: 2.5rem;
              margin: 0;
              border: 0;
              border-radius: 0;
              background: transparent;
              box-shadow: none;
              object-fit: contain;
            }

            .primary-platform {
              justify-content: center;
              padding-block: 1em 2em;
            }

            .primary-platform a {
              width: 50%;
              flex-direction: column;
              justify-content: center;
              text-align: center;
            }

            .primary-platform img {
              width: 100%;
              height: auto;
            }

            .platform-list {
              max-width: 24rem;
              margin-block-start: 2em;
              margin-inline: auto;
              justify-content: center;
              flex-wrap: nowrap;
              gap: clamp(0.4rem, 2vw, 1rem);
            }

            .platform-list img {
              width: 4rem;
              height: 4rem;
            }

            .personality {
              display: flow-root;
              margin-block: 2rem 3rem;
            }

            .personality-heading {
              display: flex;
              align-items: baseline;
              gap: 1rem;
              white-space: nowrap;
            }

            .personality-heading h3,
            .personality-heading p {
              margin-block: 0 1rem;
            }

            .personality > img {
              float: right;
              width: 7rem;
              height: 7rem;
              margin: 0 0 1rem 1.5rem;
              border-radius: 50%;
              object-fit: cover;
            }

            .credits {
              margin-top: clamp(4rem, 10vw, 8rem);
              font-size: 0.875rem;
              opacity: 0.72;
            }

            @media (max-width: 32rem) {
              .radio-hero {
                min-height: 62svh;
              }

              .personality > img {
                display: block;
                float: none;
                width: 6rem;
                height: 6rem;
                margin: 0 auto 1rem;
              }
            }
            `,
            js: `
              (() => {
                const setupHeader = () => {
                  const header = document.querySelector(".header");
                  const title = document.querySelector(".program-title");

                  if (!header) return;
                  if (!title) {
                    header.classList.add("is-visible");
                    return;
                  }

                  const updateHeader = () => {
                    const titleHasPassed = title.getBoundingClientRect().bottom <= 0;
                    header.classList.toggle("is-visible", titleHasPassed);
                  };

                  updateHeader();
                  new IntersectionObserver(updateHeader).observe(title);
                };

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", setupHeader, { once: true });
                } else {
                  setupHeader();
                }
              })();
            `,
          }),
        ],
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
