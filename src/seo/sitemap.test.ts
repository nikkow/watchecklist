import { describe, expect, it } from 'vitest';
import { buildSitemap } from './sitemap';

const site = new URL('https://watchecklist.com');

describe('buildSitemap', () => {
  const xml = buildSitemap([{ en: '/en/about/', fr: '/fr/a-propos/' }], site);

  it('lists the page once per locale', () => {
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml).toContain('<loc>https://watchecklist.com/en/about/</loc>');
    expect(xml).toContain('<loc>https://watchecklist.com/fr/a-propos/</loc>');
  });

  it('links every translation and the default locale from each entry', () => {
    expect(
      xml.match(/hreflang="fr" href="https:\/\/watchecklist.com\/fr\/a-propos\/"/g),
    ).toHaveLength(2);
    expect(
      xml.match(/hreflang="x-default" href="https:\/\/watchecklist.com\/en\/about\/"/g),
    ).toHaveLength(2);
  });

  it('is an empty url set without pages', () => {
    expect(buildSitemap([], site)).not.toContain('<url>');
  });
});
