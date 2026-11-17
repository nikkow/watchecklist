import { useTranslations, type Locale } from '../../i18n';
import { loadLists } from '../../lists/load';
import type { ListView } from '../../lists/view-types';
import { buildListView } from '../../lists/view';
import { loadCatalog } from '../../tmdb/load-catalog';

/**
 * Builds the static paths of the list pages of one locale.
 *
 * @param locale - Locale of the pages.
 * @returns One path per list, with its view as props.
 */
export async function listStaticPaths(
  locale: Locale,
): Promise<{ params: { slug: string }; props: { view: ListView } }[]> {
  return (await listViews(locale)).map((view) => ({
    params: { slug: view.slug },
    props: { view },
  }));
}

/**
 * Prepares every list for rendering in one locale.
 *
 * @param locale - Locale of the pages.
 * @returns One view per list, in slug order.
 */
export async function listViews(locale: Locale): Promise<ListView[]> {
  const [lists, catalog] = await Promise.all([loadLists(), loadCatalog()]);
  const t = useTranslations(locale);
  return [...lists].map(([slug, list]) => buildListView(slug, list, catalog, locale, t));
}
