import type { APIRoute } from 'astro';
import { listAlternates, pages } from '../i18n/routes';
import { loadLists } from '../lists/load';
import { buildSitemap } from '../seo/sitemap';

/** Sitemap of every localized page, so search engines find each list in both languages. */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Set `site` in astro.config to build the sitemap');
  const slugs = [...(await loadLists()).keys()];
  const xml = buildSitemap([...Object.values(pages), ...slugs.map(listAlternates)], site);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
