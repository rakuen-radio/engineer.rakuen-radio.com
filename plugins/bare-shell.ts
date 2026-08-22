import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Plugin, ResolvedConfig } from "vite-plus";

interface BareShellOptions {
  /** Absolute site URL, used for canonical and Open Graph metadata. */
  siteUrl: string;
  /** Site description, used for the page metadata. */
  description?: string;
  /** Value for the `lang` attribute on the generated documents. */
  lang?: string;
}

interface NavItem {
  href: string;
  label: string;
}

const TITLE = /<title>([^<]*)<\/title>/;
const HEADINGS = /<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
const OG_IMAGE = "og-image.png";

const stripTags = (html: string) => html.replace(/<[^>]+>/g, "").trim();

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Post-processes the HTML emitted by Ox Content's bare mode SSG.
 *
 * Bare mode intentionally outputs an unstyled document with only the
 * rendered Markdown body, so this plugin owns everything around it:
 *  - sets the document language
 *  - links the stylesheet Vite emitted (Lightning CSS output, hashed)
 *  - writes the page metadata, including the generated OG image
 *  - wraps the body content with the site header / main / footer
 *  - removes the JavaScript Rollup emits for the CSS entry so the deployed
 *    site ships zero JavaScript
 *
 * The site is a single page, so its chrome is derived from that page rather
 * than configured here: the header title comes from the home page `<title>`
 * and the nav is built from its `<h2>` section headings.
 *
 * Most of the metadata below is not project-specific — ox-content computes
 * it for themed builds and drops it in bare mode. Upstream ask to make that
 * unnecessary: https://github.com/ubugeeei-prod/ox-content/issues/609
 */
export function bareShell(options: BareShellOptions): Plugin {
  const { siteUrl, description, lang = "ja" } = options;
  const origin = siteUrl.replace(/\/$/, "");
  let config: ResolvedConfig;
  let stylesheets: string[] = [];

  async function collectHtmlFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return collectHtmlFiles(full);
        return entry.name.endsWith(".html") ? [full] : [];
      }),
    );
    return files.flat();
  }

  async function removeJavaScript(dir: string): Promise<void> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await removeJavaScript(full);
        // The entry chunk may have been the only thing in its directory.
        await fs.rmdir(full).catch(() => {});
      } else if (entry.name.endsWith(".js")) {
        await fs.rm(full);
      }
    }
  }

  function readNav(homeHtml: string): NavItem[] {
    return [...homeHtml.matchAll(HEADINGS)].map(([, id, label]) => ({
      href: `${config.base}#${id}`,
      label: stripTags(label),
    }));
  }

  /** Public URL of a built page, e.g. `dist/404/index.html` -> `/404/`. */
  function pageUrl(file: string, outDir: string): string {
    const rel = path.relative(outDir, file).split(path.sep).join("/");
    return `${origin}${config.base}${rel.replace(/(^|\/)index\.html$/, "$1")}`;
  }

  async function metadata(file: string, outDir: string, title: string) {
    const url = pageUrl(file, outDir);
    const ogImage = path.join(path.dirname(file), OG_IMAGE);
    const hasOgImage = await fs.access(ogImage).then(
      () => true,
      () => false,
    );

    return [
      description &&
        `  <meta name="description" content="${escapeAttr(description)}">`,
      `  <link rel="canonical" href="${url}">`,
      `  <meta property="og:type" content="website">`,
      `  <meta property="og:title" content="${escapeAttr(title)}">`,
      description &&
        `  <meta property="og:description" content="${escapeAttr(description)}">`,
      `  <meta property="og:url" content="${url}">`,
      hasOgImage &&
        `  <meta property="og:image" content="${url}${OG_IMAGE}">`,
      hasOgImage && `  <meta name="twitter:card" content="summary_large_image">`,
    ]
      .filter((line) => typeof line === "string")
      .join("\n");
  }

  function shell(siteName: string, nav: NavItem[]) {
    const links = stylesheets
      .map((href) => `  <link rel="stylesheet" href="${href}">`)
      .join("\n");

    const navLinks = nav
      .map(({ href, label }) => `      <a href="${href}">${label}</a>`)
      .join("\n");

    const header = `<header class="site-header">
  <div class="site-header__inner">
    <a class="site-header__title" href="${config.base}">${siteName}</a>${
      nav.length === 0
        ? ""
        : `
    <nav class="site-nav">
${navLinks}
    </nav>`
    }
  </div>
</header>`;

    const footer = `<footer class="site-footer">
  <div class="site-footer__inner">© ${new Date().getFullYear()} ${siteName}</div>
</footer>`;

    return { links, header, footer };
  }

  return {
    name: "rakuen:bare-shell",
    apply: "build",
    // Must run after Ox Content's SSG has written the bare HTML files.
    enforce: "post",
    configResolved(resolved) {
      config = resolved;
    },
    generateBundle(_options, bundle) {
      stylesheets = Object.keys(bundle)
        .filter((fileName) => fileName.endsWith(".css"))
        .map((fileName) => `${config.base}${fileName}`);
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const home = await fs.readFile(path.join(outDir, "index.html"), "utf-8");
      const siteName = TITLE.exec(home)?.[1] ?? "";
      const { links, header, footer } = shell(siteName, readNav(home));

      for (const file of await collectHtmlFiles(outDir)) {
        const html = await fs.readFile(file, "utf-8");
        const head = await metadata(file, outDir, TITLE.exec(html)?.[1] ?? "");

        await fs.writeFile(
          file,
          html
            .replace('<html lang="en">', `<html lang="${lang}">`)
            .replace("</head>", `${head}\n${links}\n</head>`)
            .replace("<body>", `<body>\n${header}\n<main class="site-main">`)
            .replace("</body>", `</main>\n${footer}\n</body>`),
        );
      }

      // Cloudflare's `not_found_handling: "404-page"` expects a root-level
      // 404.html, but the SSG emits clean-URL directories. Copy instead of
      // rename: renames escape Vite Task's output tracking, so a cache
      // replay would restore dist without the file.
      await fs.writeFile(
        path.join(outDir, "404.html"),
        await fs.readFile(path.join(outDir, "404", "index.html")),
      );

      await removeJavaScript(outDir);
    },
  };
}
