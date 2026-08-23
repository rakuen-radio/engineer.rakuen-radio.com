// The pragma repeats tsconfig's `jsxImportSource`: Vite loads this module
// through the config, and the config loader does not read tsconfig.
/** @jsxImportSource @ox-content/vite-plugin */
import {
  each,
  usePageProps,
  useSiteConfig,
  type ThemeProps,
} from "@ox-content/vite-plugin";

interface LayoutOptions {
  /** Absolute site URL, used for canonical and Open Graph metadata. */
  siteUrl: string;
  /** Href of the stylesheet Vite emitted; only known once the bundle is written. */
  stylesheet: () => string;
}

const HOME = "/index.html";

/** `/404/index.html` -> `/404/`, `/index.html` -> `/`. */
const clean = (url: string) => url.replace(/index\.html$/, "");

/**
 * The whole document for every page (`ssg.render`).
 *
 * The site is a single page, so its chrome comes from that page: the header
 * title is the site name, the nav is the home page's `##` headings, and each
 * page's own frontmatter supplies the metadata.
 */
export function siteLayout({ siteUrl, stylesheet }: LayoutOptions) {
  const origin = siteUrl.replace(/\/$/, "");

  return function SiteLayout({ children }: ThemeProps) {
    const page = usePageProps();
    const site = useSiteConfig();
    const home = site.pages.find(({ url }) => url === HOME) ?? page;
    const url = `${origin}${clean(page.url)}`;
    const nav = home.toc[0]?.children ?? [];

    return (
      <html lang="ja">
        <head>
          {/* `charSet`, not `charset`: the runtime writes prop names as-is,
              but only the React spelling type-checks — ox-content#629. */}
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{page.title}</title>
          {page.description && (
            <meta name="description" content={page.description} />
          )}
          <link rel="canonical" href={url} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={page.title} />
          {page.description && (
            <meta property="og:description" content={page.description} />
          )}
          <meta property="og:url" content={url} />
          <meta property="og:image" content={`${url}og-image.png`} />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="stylesheet" href={stylesheet()} />
        </head>
        <body>
          <header class="site-header">
            <div class="site-header__inner">
              <a class="site-header__title" href={site.base}>
                {site.name}
              </a>
              {nav.length > 0 && (
                <nav class="site-nav">
                  {each(nav, ({ slug, text }) => (
                    <a href={`${site.base}#${slug}`}>{text}</a>
                  ))}
                </nav>
              )}
            </div>
          </header>
          <main class="site-main">{children}</main>
          <footer class="site-footer">
            <div class="site-footer__inner">
              © {new Date().getFullYear()} {site.name}
            </div>
          </footer>
        </body>
      </html>
    );
  };
}
