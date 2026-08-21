import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Plugin, ResolvedConfig } from "vite-plus";

interface BareShellOptions {
  siteName: string;
  nav: { href: string; label: string }[];
  footer: string;
  stylesheets: string[];
  lang?: string;
}

/**
 * Post-processes the HTML emitted by Ox Content's bare mode SSG.
 *
 * Bare mode intentionally outputs an unstyled document with no site chrome,
 * so this plugin owns everything around the content:
 *  - sets the document language
 *  - links the design-token and site stylesheets into <head>
 *  - wraps the body content with the site header / main / footer
 *  - removes the placeholder JS entry chunk so the deployed site ships
 *    zero JavaScript
 */
export function bareShell(options: BareShellOptions): Plugin {
  const { siteName, nav, footer, stylesheets, lang = "ja" } = options;
  let config: ResolvedConfig;

  const headLinks = stylesheets
    .map((href) => `  <link rel="stylesheet" href="${href}">`)
    .join("\n");

  const navLinks = nav
    .map(({ href, label }) => `      <a href="${href}">${label}</a>`)
    .join("\n");

  const header = `<header class="site-header">
  <div class="site-header__inner">
    <a class="site-header__title" href="/">${siteName}</a>
    <nav class="site-nav">
${navLinks}
    </nav>
  </div>
</header>`;

  const footerHtml = `<footer class="site-footer">
  <div class="site-footer__inner">${footer}</div>
</footer>`;

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

  function transform(html: string): string {
    return html
      .replace('<html lang="en">', `<html lang="${lang}">`)
      .replace("</head>", `${headLinks}\n</head>`)
      .replace("<body>", `<body>\n${header}\n<main class="site-main">`)
      .replace("</body>", `</main>\n${footerHtml}\n</body>`);
  }

  return {
    name: "rakuen:bare-shell",
    apply: "build",
    // Must run after Ox Content's SSG has written the bare HTML files.
    enforce: "post",
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);

      for (const file of await collectHtmlFiles(outDir)) {
        const html = await fs.readFile(file, "utf-8");
        await fs.writeFile(file, transform(html));
      }

      // Cloudflare's `not_found_handling: "404-page"` expects a root-level
      // 404.html, but the SSG emits clean-URL directories.
      const notFoundDir = path.join(outDir, "404");
      try {
        await fs.rename(
          path.join(notFoundDir, "index.html"),
          path.join(outDir, "404.html"),
        );
        await fs.rm(notFoundDir, { recursive: true, force: true });
      } catch {
        // No 404 page in this build.
      }

      // Drop the placeholder entry chunk and its assets dir: the site is
      // fully static and must not ship any JavaScript.
      await fs.rm(path.join(outDir, "assets"), { recursive: true, force: true });
      for (const entry of await fs.readdir(outDir)) {
        if (entry.endsWith(".js")) {
          await fs.rm(path.join(outDir, entry), { force: true });
        }
      }
    },
  };
}
