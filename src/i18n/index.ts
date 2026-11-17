import { en, type Dictionary } from './en';
import { fr } from './fr';
import type { Locale } from './locales';

const dictionaries: Record<Locale, Dictionary> = { en, fr };

/**
 * Returns the user-facing strings of a locale.
 *
 * @param locale - Locale of the page being rendered.
 * @returns The full dictionary for that locale.
 */
export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export { locales, defaultLocale, toLocale, type Locale } from './locales';
export type { Dictionary } from './en';
