import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Plugin, ResolvedConfig } from "vite-plus";

/**
 * Finishes the static output around ox-content's pages.
 *
 * Cloudflare's `not_found_handling: "404-page"` wants a root-level
 * `404.html` that the clean-URL output does not produce, and the chunks
 * Vite emitted for the placeholder entry should not ship.
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
