export const locales = ['en', 'fr'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Narrows an arbitrary string (a route param, `Astro.currentLocale`) to a supported locale.
 *
 * @param value - Candidate locale code.
 * @returns The locale when supported, otherwise the default locale.
 */
export function toLocale(value: string | undefined): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale;
}
