import { defaultLocale, locales, type Locale } from '../i18n/locales';
import type { Alternates } from '../i18n/routes';

/** One hreflang annotation: a locale code, or `x-default` for visitors matching none. */
export interface AlternateLink {
  hreflang: Locale | 'x-default';
  href: string;
}

/**
 * Lists the hreflang annotations of a page, shared by the page head and the sitemap so both
 * give search engines the same signal.
 *
 * @param alternates - The page's path in every locale.
 * @param site - Origin the paths resolve against.
 * @returns One link per locale, then `x-default` pointing to the default locale.
 */
export function alternateLinks(alternates: Alternates, site: URL): AlternateLink[] {
  return [
    ...locales.map((locale) => ({
      hreflang: locale,
      href: new URL(alternates[locale], site).href,
    })),
    { hreflang: 'x-default', href: new URL(alternates[defaultLocale], site).href },
  ];
}

const openGraphLocales: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR' };

/**
 * Converts a site locale to the `language_TERRITORY` form Open Graph expects.
 *
 * @param locale - Site locale.
 * @returns The Open Graph locale.
 */
export function openGraphLocale(locale: Locale): string {
  return openGraphLocales[locale];
}
