import type { PageKey } from '../i18n/routes';

/** A primary navigation entry: the page it targets and its localized label. */
export interface NavLink {
  key: PageKey;
  label: string;
}
