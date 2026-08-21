/**
 * Framework-less JSX template for per-page OG images (1200x630).
 *
 * Rendered at build time only — it never ships to the browser. Uses the
 * Ox Content JSX runtime (see tsconfig `jsxImportSource`), not React.
 *
 * NOTE: upstream ox-content currently routes `.tsx` OG templates through
 * react-dom/server and skips OG generation entirely while `ssg.bare` is
 * enabled, so this template is dormant until that changes. Keep it in sync
 * with the design tokens in `tokens/`.
 */

interface OgProps {
  title: string;
  description?: string;
  siteName?: string;
}

export default function OgTemplate(props: OgProps) {
  const { title, description, siteName = "エンジニアの楽園ラジオ" } = props;

  return (
    <>
      <style>{`
        .og {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 80px;
          background: #faf6ef;
          border-top: 12px solid #ff6b4a;
          font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
        }
        .title {
          font-size: 60px;
          font-weight: 700;
          line-height: 1.2;
          color: #1c1917;
          margin: 0 0 24px;
        }
        .description {
          font-size: 28px;
          line-height: 1.5;
          color: #57534e;
          margin: 0;
        }
        .site-name {
          margin-top: auto;
          font-size: 24px;
          font-weight: 700;
          color: #0e7490;
        }
      `}</style>
      <div class="og">
        <h1 class="title">{title}</h1>
        {description && <p class="description">{description}</p>}
        <span class="site-name">{siteName}</span>
      </div>
    </>
  );
}
