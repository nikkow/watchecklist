import { describe, expect, it } from 'vitest';
import { breadcrumbData, serializeStructuredData, websiteData } from './structured-data';

describe('websiteData', () => {
  it('names the site in the page locale', () => {
    expect(websiteData(new URL('https://watchecklist.com/fr/'), 'fr', 'Bon ordre.')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'watchecklist',
      url: 'https://watchecklist.com/fr/',
      inLanguage: 'fr',
      description: 'Bon ordre.',
    });
  });
});

describe('breadcrumbData', () => {
  it('numbers the trail from the home page', () => {
    const data = breadcrumbData([
      { name: 'watchecklist', url: new URL('https://watchecklist.com/en/') },
      { name: 'Arrowverse', url: new URL('https://watchecklist.com/en/lists/arrowverse/') },
    ]);
    expect(data['itemListElement']).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'watchecklist',
        item: 'https://watchecklist.com/en/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Arrowverse',
        item: 'https://watchecklist.com/en/lists/arrowverse/',
      },
    ]);
  });
});

describe('serializeStructuredData', () => {
  it('cannot close the script element', () => {
    const json = serializeStructuredData({ name: '</script><b>' });
    expect(json).not.toContain('</');
    expect(JSON.parse(json)).toEqual({ name: '</script><b>' });
  });
});
