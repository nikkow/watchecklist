import { describe, expect, it } from 'vitest';
import { trackingUrl } from './matomo';

describe('trackingUrl', () => {
  const view = {
    url: 'https://watchecklist.com/fr/listes/arrowverse/',
    title: 'Arrowverse · watchecklist',
    referrer: '',
  };

  it('targets matomo.php of the instance, with or without a trailing slash', () => {
    for (const base of ['https://analytics.example.com', 'https://analytics.example.com/']) {
      const url = trackingUrl(base, '13', view, '42');
      expect(url.origin + url.pathname).toBe('https://analytics.example.com/matomo.php');
    }
  });

  it('reports the page view without any visitor identifier', () => {
    const params = trackingUrl('https://analytics.example.com', '13', view, '42').searchParams;
    expect(Object.fromEntries(params)).toEqual({
      idsite: '13',
      rec: '1',
      apiv: '1',
      send_image: '0',
      url: view.url,
      action_name: view.title,
      urlref: '',
      rand: '42',
    });
    for (const key of ['_id', 'cid', 'uid', '_idvc', 'cookie']) expect(params.has(key)).toBe(false);
  });
});
