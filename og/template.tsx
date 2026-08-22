/**
 * Framework-less JSX template for per-page OG images (1200x630).
 *
 * Rendered at build time only — it never ships to the browser. Uses the
 * Ox Content JSX runtime (see tsconfig `jsxImportSource`), not React.
 *
 * Colors and typefaces are read from the generated design tokens, so only
 * the measurements of the OG canvas itself live here.
 *
 * Dormant for now: ox-content skips OG generation while `ssg.bare` is set
 * (https://github.com/ubugeeei-prod/ox-content/issues/602).
 */
import { readFileSync } from "node:fs";

const tokens = readFileSync(
  new URL("../styles/tokens.css", import.meta.url),
  "utf-8",
);

interface OgProps {
  title: string;
  description?: string;
  siteName?: string;
}

export default function OgTemplate(props: OgProps) {
  const { title, description, siteName } = props;

  return (
    <>
      <div class="og">
        <h1 class="title">{title}</h1>
        {description && <p class="description">{description}</p>}
        {siteName && <span class="site-name">{siteName}</span>}
      </div>
      <style>{`
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
      `}</style>
    </>
  );
}
