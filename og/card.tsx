/**
 * OG image card (1200x630).
 *
 * Rendered at build time only — it never ships to the browser. Written for
 * the Ox Content JSX runtime (tsconfig `jsxImportSource`), not React;
 * [`template.ts`](./template.ts) renders it to the HTML string ox-content
 * expects.
 *
 * Colors and typefaces come from the default theme, the same source the
 * pages are styled from, so the card follows the site without a palette of
 * its own.
 */
import {
  defaultTheme,
  raw,
  type OgImageTemplateProps,
} from "@ox-content/vite-plugin";

const { colors = {}, fonts = {} } = defaultTheme;

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
      {/* `raw`: the runtime escapes text children, which would mangle the CSS. */}
      <style>
        {raw(`
        .og {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 80px;
          background: ${colors.background};
          border-top: 12px solid ${colors.primary};
          font-family: ${fonts.sans};
        }
        .title {
          font-size: 60px;
          font-weight: 700;
          line-height: 1.3;
          color: ${colors.text};
          margin: 0 0 24px;
        }
        .description {
          font-size: 28px;
          line-height: 1.5;
          color: ${colors.textMuted};
          margin: 0;
        }
        .site-name {
          margin-top: auto;
          font-size: 24px;
          font-weight: 700;
          color: ${colors.primary};
        }
      `)}
      </style>
    </>
  );
}
