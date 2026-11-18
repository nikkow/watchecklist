import { locales } from '../i18n/locales';
import type { Alternates } from '../i18n/routes';
import { alternateLinks } from './alternates';

/**
 * Renders the sitemap: one entry per page and locale, each linking its translations.
 *
 * @param pages - Every indexable page, as its path per locale.
 * @param site - Origin the paths resolve against.
 * @returns The sitemap XML document.
 */
export function buildSitemap(pages: readonly Alternates[], site: URL): string {
  const urls = pages.flatMap((alternates) => {
    const links = alternateLinks(alternates, site)
      .map(
        ({ hreflang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
      )
      .join('\n');
    return locales.map(
      (locale) =>
        `  <url>\n    <loc>${new URL(alternates[locale], site).href}</loc>\n${links}\n  </url>`,
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
