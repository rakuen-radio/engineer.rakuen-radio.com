/**
 * OG image card (1200x630).
 *
 * Rendered at build time only — it never ships to the browser. Written for
 * the Ox Content JSX runtime (tsconfig `jsxImportSource`), not React;
 * [`template.ts`](./template.ts) renders it to the HTML string ox-content
 * expects.
 *
 * Colors and typefaces are read from the generated design tokens, so only
 * the measurements of the OG canvas itself live here.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { JSXNode, OgImageTemplateProps } from "@ox-content/vite-plugin";

// ox-content bundles this template into `.cache/og-images/` before running
// it, so the tokens are read from the project root, not from next to it.
const tokens = readFileSync(resolve("styles/tokens.css"), "utf-8");

// The runtime escapes text children, which would mangle the CSS. That is
// what the plugin's `raw()` is for, but a value import from
// @ox-content/vite-plugin pulls the whole plugin into the template bundle
// (https://github.com/ubugeeei-prod/ox-content/issues/608), so the
// node is built by hand from the public `JSXNode` shape.
const raw = (html: string): JSXNode => ({ __html: html });

export function OgCard(props: OgImageTemplateProps) {
  const { title, description, siteName } = props;

  return (
    <>
      <div class="og">
        <h1 class="title">{title}</h1>
        {description && <p class="description">{description}</p>}
        {/* On the home page the title already is the site name. */}
        {siteName && siteName !== title && (
          <span class="site-name">{siteName}</span>
        )}
      </div>
      <style>
        {raw(`
        ${tokens}
        .og {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 80px;
          background: var(--rkn-color-background-body);
          border-top: 12px solid var(--rkn-color-accent-primary);
          font-family: var(--rkn-font-family-sans);
        }
        .title {
          font-size: 60px;
          font-weight: var(--rkn-font-weight-bold);
          line-height: var(--rkn-font-leading-tight);
          color: var(--rkn-color-text-primary);
          margin: 0 0 24px;
        }
        .description {
          font-size: 28px;
          line-height: var(--rkn-font-leading-base);
          color: var(--rkn-color-text-muted);
          margin: 0;
        }
        .site-name {
          margin-top: auto;
          font-size: 24px;
          font-weight: var(--rkn-font-weight-bold);
          color: var(--rkn-color-accent-secondary);
        }
      `)}
      </style>
    </>
  );
}
