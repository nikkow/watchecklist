import type { APIRoute } from 'astro';
import { useTranslations } from '../i18n';
import { listAlternates, pages } from '../i18n/routes';
import { loadLists } from '../lists/load';
import { localize } from '../lists/view';
import { buildLlmsTxt } from '../seo/llms';
import { repositoryUrl } from '../site';

/** Summary of the site for language models, in English like the default locale. */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Set `site` in astro.config to build llms.txt');
  const lists = [...(await loadLists())].map(([slug, list]) => ({
    title: localize(list.title, 'en'),
    description: localize(list.description, 'en'),
    paths: listAlternates(slug),
  }));
  const text = buildLlmsTxt(
    {
      description: useTranslations('en').meta.description,
      about: pages.about,
      lists,
      repositoryUrl,
    },
    site,
  );
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
