import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Plugin, ResolvedConfig } from "vite-plus";

/**
 * Copies the 404 page to where Cloudflare looks for it.
 *
 * `not_found_handling: "404-page"` wants a root-level `404.html` that the
 * clean-URL output does not produce. Once ox-content releases `ssg.notFound`
 * this plugin can be deleted in favor of that option.
 */
export function notFoundPage(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "rakuen:not-found-page",
    apply: "build",
    // Must run after ox-content's SSG has written the pages.
    enforce: "post",
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);

      // Copy instead of rename: renames escape Vite Task's output tracking,
      // so a cache replay would restore dist without the file.
      await fs.writeFile(
        path.join(outDir, "404.html"),
        await fs.readFile(path.join(outDir, "404", "index.html")),
      );
    },
  };
}
