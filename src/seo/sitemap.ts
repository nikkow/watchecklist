import { locales } from '../i18n/locales';
import type { Alternates } from '../i18n/routes';
import { alternateLinks } from './alternates';

/** One indexable page of the sitemap. */
export interface SitemapPage {
  /** The page's path in every locale. */
  alternates: Alternates;
  /** Day its content last changed, as `YYYY-MM-DD`; left out when unknown. */
  lastmod?: string | null;
}

/**
 * Renders the sitemap: one entry per page and locale, each linking its translations.
 *
 * @param pages - Every indexable page.
 * @param site - Origin the paths resolve against.
 * @returns The sitemap XML document.
 */
export function buildSitemap(pages: readonly SitemapPage[], site: URL): string {
  const urls = pages.flatMap(({ alternates, lastmod }) => {
    const links = alternateLinks(alternates, site)
      .map(
        ({ hreflang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
      )
      .join('\n');
    const modified = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '';
    return locales.map(
      (locale) =>
        `  <url>\n    <loc>${new URL(alternates[locale], site).href}</loc>\n${modified}${links}\n  </url>`,
    );
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
