import { describe, expect, it } from 'vitest';
import { alternateLinks, openGraphLocale } from './alternates';

const site = new URL('https://watchecklist.com');

describe('alternateLinks', () => {
  it('links every locale, then x-default to the default locale', () => {
    expect(alternateLinks({ en: '/en/about/', fr: '/fr/a-propos/' }, site)).toEqual([
      { hreflang: 'en', href: 'https://watchecklist.com/en/about/' },
      { hreflang: 'fr', href: 'https://watchecklist.com/fr/a-propos/' },
      { hreflang: 'x-default', href: 'https://watchecklist.com/en/about/' },
    ]);
  });
});

describe('openGraphLocale', () => {
  it('adds the territory Open Graph expects', () => {
    expect(openGraphLocale('en')).toBe('en_US');
    expect(openGraphLocale('fr')).toBe('fr_FR');
  });
});
