import type { Alternates } from '../i18n/routes';

/** One watch list as described to language models. */
export interface LlmsList {
  title: string;
  description: string;
  paths: Alternates;
}

/** Everything `llms.txt` describes. */
export interface LlmsContent {
  description: string;
  about: Alternates;
  lists: readonly LlmsList[];
  repositoryUrl: string;
}

/**
 * Renders `llms.txt` (llmstxt.org format): a Markdown summary of the site for language models.
 *
 * @param content - Site description, pages and lists, in English.
 * @param site - Origin the paths resolve against.
 * @returns The Markdown document.
 */
export function buildLlmsTxt(content: LlmsContent, site: URL): string {
  const url = (path: string): string => new URL(path, site).href;
  const lists = content.lists.map(
    (list) =>
      `- [${list.title}](${url(list.paths.en)}): ${list.description} French: ${url(list.paths.fr)}`,
  );
  return [
    '# watchecklist',
    '',
    `> ${content.description}`,
    '',
    'Free website and installable app. No account, no tracking: progress stays on the device.',
    'Lists are hand-curated and shared under CC BY-SA 4.0; episode data comes from TMDB.',
    'Pages exist in English (`/en/`) and French (`/fr/`).',
    '',
    '## Watch lists',
    '',
    ...lists,
    '',
    '## About',
    '',
    `- [About watchecklist](${url(content.about.en)}): privacy, data sources and licences.`,
    `- [Source code and lists](${content.repositoryUrl}): suggest or fix a list on GitHub.`,
    '',
  ].join('\n');
}
