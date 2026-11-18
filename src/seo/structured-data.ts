import type { Locale } from '../i18n/locales';

/** A schema.org node, serialized as JSON-LD in the page head. */
export type StructuredData = Readonly<Record<string, unknown>>;

/**
 * Describes the site, for the home page of each locale.
 *
 * @param url - Absolute URL of that home page.
 * @param locale - Its locale.
 * @param description - Its meta description.
 * @returns A schema.org `WebSite` node.
 */
export function websiteData(url: URL, locale: Locale, description: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'watchecklist',
    url: url.href,
    inLanguage: locale,
    description,
  };
}

/**
 * Describes where a page sits, so search results can show its path instead of its URL.
 *
 * @param trail - Pages from the home page down to the current one.
 * @returns A schema.org `BreadcrumbList` node.
 */
export function breadcrumbData(trail: readonly { name: string; url: URL }[]): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: url.href,
    })),
  };
}

/**
 * Serializes a node for an inline `<script type="application/ld+json">`.
 *
 * @param data - The node.
 * @returns JSON where `<` is escaped, so no text can close the script element early.
 */
export function serializeStructuredData(data: StructuredData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
