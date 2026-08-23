import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Plugin, ResolvedConfig } from "vite-plus";

let stylesheet = "";

/**
 * Href of the stylesheet Vite emitted for the CSS entry.
 *
 * The name is content-hashed, so it only exists once the bundle has been
 * written — the theme reads it while ox-content renders, which happens
 * after `generateBundle`.
 */
export const stylesheetHref = () => stylesheet;

/**
 * Finishes the static output around ox-content's pages.
 *
 * Vite emits a JS chunk for the CSS entry, and Cloudflare's
 * `not_found_handling: "404-page"` wants a root-level `404.html` that the
 * clean-URL output does not produce.
 */
export function staticOutput(): Plugin {
  let config: ResolvedConfig;

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

  return {
    name: "rakuen:static-output",
    apply: "build",
    // Must run after ox-content's SSG has written the pages.
    enforce: "post",
    configResolved(resolved) {
      config = resolved;
    },
    generateBundle(_options, bundle) {
      const css = Object.keys(bundle).find((file) => file.endsWith(".css"));
      stylesheet = css ? `${config.base}${css}` : "";
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);

      // Copy instead of rename: renames escape Vite Task's output tracking,
      // so a cache replay would restore dist without the file.
      await fs.writeFile(
        path.join(outDir, "404.html"),
        await fs.readFile(path.join(outDir, "404", "index.html")),
      );

      await removeJavaScript(outDir);
    },
  };
}
