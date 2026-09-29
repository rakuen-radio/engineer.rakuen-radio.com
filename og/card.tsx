/**
 * OG image card (1200x630).
 *
 * Rendered at build time only — it never ships to the browser. Written for
 * the Ox Content JSX runtime (tsconfig `jsxImportSource`), not React;
 * [`template.ts`](./template.ts) renders it to the HTML string ox-content
 * expects.
 *
 * Colors and typefaces come from the Voltage themes used by the page.
 */
import voltageColors from "@ox-content/theme-color-voltage";
import voltage from "@ox-content/theme-voltage";
import { raw, type OgImageTemplateProps } from "@ox-content/vite-plugin";

const colors = voltageColors.darkColors ?? voltageColors.colors ?? {};
const { fonts = {} } = voltage;

export function OgCard(props: OgImageTemplateProps) {
  const { title, description, siteName } = props;

  return (
    <>
      <div class="og">
        <span class="eyebrow">ENGINEER / PODCAST</span>
        <h1 class="title">{title}</h1>
        {description && <p class="description">{description}</p>}
        {/* On the home page the title already is the site name. */}
        {siteName && siteName !== title && <span class="site-name">{siteName}</span>}
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
          background:
            radial-gradient(circle at 82% 15%, rgba(79, 214, 232, 0.2), transparent 28%),
            radial-gradient(circle at 18% 85%, rgba(199, 125, 255, 0.24), transparent 34%),
            ${colors.background};
          border: 12px solid ${colors.primary};
          font-family: ${fonts.sans};
        }
        .eyebrow {
          color: #4fd6e8;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.18em;
          margin-bottom: 28px;
        }
        .title {
          font-size: 68px;
          font-weight: 900;
          line-height: 1.18;
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
