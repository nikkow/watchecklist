import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from './llms';

const site = new URL('https://watchecklist.com');

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt(
    {
      description: 'Watch shared universes in order.',
      about: { en: '/en/about/', fr: '/fr/a-propos/' },
      lists: [
        {
          title: 'Arrowverse',
          description: 'Every episode in airing order.',
          paths: { en: '/en/lists/arrowverse/', fr: '/fr/listes/arrowverse/' },
        },
      ],
      repositoryUrl: 'https://github.com/nikkow/watchecklist',
    },
    site,
  );

  it('opens with the site name and its summary', () => {
    expect(text.startsWith('# watchecklist\n\n> Watch shared universes in order.\n')).toBe(true);
  });

  it('links each list in both languages', () => {
    expect(text).toContain(
      '- [Arrowverse](https://watchecklist.com/en/lists/arrowverse/): Every episode in airing order. French: https://watchecklist.com/fr/listes/arrowverse/',
    );
  });

  it('links the about page and the repository', () => {
    expect(text).toContain('(https://watchecklist.com/en/about/)');
    expect(text).toContain('(https://github.com/nikkow/watchecklist)');
  });
});
