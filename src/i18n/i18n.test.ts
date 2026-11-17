import { describe, expect, it } from 'vitest';
import { useTranslations, locales, toLocale } from './index';
import { listPath, pagePath, pages } from './routes';

/** Flattens a nested dictionary into dotted keys mapped to their string values. */
function flatten(value: object, prefix = ''): Record<string, unknown> {
  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object') {
      return { ...acc, ...flatten(child, path) };
    }
    return { ...acc, [path]: child };
  }, {});
}

describe('dictionaries', () => {
  const [reference, ...others] = locales.map((locale) => flatten(useTranslations(locale)));

  it('expose the same keys in every locale', () => {
    for (const dictionary of others) {
      expect(Object.keys(dictionary).sort()).toEqual(Object.keys(reference ?? {}).sort());
    }
  });

  it('have no empty string', () => {
    for (const locale of locales) {
      for (const [key, value] of Object.entries(flatten(useTranslations(locale)))) {
        expect(value, `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('never contain an em dash', () => {
    for (const locale of locales) {
      for (const value of Object.values(flatten(useTranslations(locale)))) {
        expect(String(value)).not.toContain('—');
      }
    }
  });
});

describe('toLocale', () => {
  it('keeps a supported locale and falls back to English otherwise', () => {
    expect(toLocale('fr')).toBe('fr');
    expect(toLocale('de')).toBe('en');
    expect(toLocale(undefined)).toBe('en');
  });
});

describe('routes', () => {
  it('prefix every page with its locale', () => {
    for (const page of Object.keys(pages) as (keyof typeof pages)[]) {
      for (const locale of locales) {
        expect(pagePath(page, locale).startsWith(`/${locale}/`)).toBe(true);
      }
    }
  });

  it('localize the list segment', () => {
    expect(listPath('arrowverse', 'en')).toBe('/en/lists/arrowverse/');
    expect(listPath('arrowverse', 'fr')).toBe('/fr/listes/arrowverse/');
  });
});
