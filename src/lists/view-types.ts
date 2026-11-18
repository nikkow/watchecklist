import type { Importance } from './schema.ts';

/** A list ready to render in one locale: TMDB names resolved, crossovers grouped. */
export interface ListView {
  slug: string;
  title: string;
  description: string;
  cover: { image: string | null; focus: string };
  /** Summary pieces, such as "11 series" and "2012 to 2024", joined by the page. */
  stats: string[];
  facts: ListFacts;
  series: SeriesView[];
  crossovers: CrossoverView[];
  sections: SectionView[];
  itemCount: number;
  authors: string[];
  curators: string[];
}

/** Spoiler-free figures for the "at a glance" block, already worded. */
export interface ListFacts {
  /** Total watch time, such as "About 610 hours"; null when TMDB has no runtime. */
  watchTime: string | null;
  /** How much the essentials take, null when every item is essential. */
  essentials: string | null;
  /** First item, such as "Arrow S01E01"; null for an empty list. */
  start: string | null;
}

/** A show or film of the list, used by the series filter. */
export interface SeriesView {
  /** Title id, such as `tv:1412`. */
  key: string;
  name: string;
  poster: string | null;
  itemCount: number;
}

/** A crossover of the list, for the crossover map. */
export interface CrossoverView {
  slug: string;
  name: string;
  /** Title of the section where it starts. */
  sectionTitle: string;
  itemCount: number;
}

export interface SectionView {
  title: string;
  note: string | null;
  /** The show seasons the section covers, such as "Arrow 3 · The Flash 1". */
  seasons: string;
  blocks: BlockView[];
  itemCount: number;
}

/** A section shows items one by one, or grouped when they form a crossover. */
export type BlockView =
  | { type: 'item'; item: ItemView }
  | { type: 'crossover'; slug: string; header: string; items: ItemView[] };

export interface ItemView {
  id: string;
  /** Title id of its show or film, such as `tv:1412`. */
  seriesKey: string;
  /** Episode code (`S03E08`), or the film name. */
  label: string;
  /** Show name for an episode, "Film" for a film. */
  seriesName: string;
  /** Show and code, such as "Arrow S03E08", for screen readers and the next-up card. */
  fullName: string;
  poster: string | null;
  importance: Importance;
  importanceLabel: string;
  note: string | null;
  /** Episode title in the page locale, hidden until the viewer asks; null for a film. */
  title: string | null;
  inCrossover: boolean;
  /** Shown in the next-up card when the item is part of a crossover. */
  crossoverHint: string | null;
}
