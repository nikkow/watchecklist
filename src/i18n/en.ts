export const en = {
  meta: {
    description:
      'Watch every episode and film of a shared universe in the right order. Every crossover, every episode, spoiler-free.',
  },
  language: {
    name: 'English',
    code: 'EN',
    menuLabel: 'Language',
    current: 'Language: English',
  },
  header: {
    home: 'watchecklist, home',
    openMenu: 'Open menu',
    primaryNav: 'Main',
    lists: 'Lists',
    about: 'About',
  },
  home: {
    title: 'In order.',
    subtitle: 'Every crossover, every episode, spoiler-free.',
    intro:
      'Hand-curated watch orders for shared universes, films included. Tick as you go, no account needed.',
    listsTitle: 'Lists',
    listsEmpty: 'The first watch orders are being curated.',
    suggestList: 'Suggest a list on GitHub',
  },
  about: {
    title: 'About',
    intro:
      'watchecklist is a free checklist for watching the episodes and films of a shared universe in the right order, crossovers included.',
    privacyTitle: 'No account, no tracking',
    privacy:
      'Your progress is stored in this browser only. There is no account, no analytics and no tracker.',
    dataTitle: 'Data sources',
    data: 'Watch orders are edited by hand and published under CC BY-SA 4.0. Titles, dates and images come from TMDB.',
    tmdbLink: 'The Movie Database (TMDB)',
    codeTitle: 'Open source',
    code: 'The code is released under the MIT licence.',
  },
  list: {
    backToLists: 'Back to lists',
    series: (count: number) => `${count} series`,
    crossovers: (count: number) => `${count} ${count === 1 ? 'crossover' : 'crossovers'}`,
    episodes: (count: number) => `${count} ${count === 1 ? 'episode' : 'episodes'}`,
    movies: (count: number) => `${count} ${count === 1 ? 'film' : 'films'}`,
    years: (from: string, to: string) => (from === to ? from : `${from} to ${to}`),
    progress: 'Progress',
    nextUp: 'Up next',
    markWatched: 'Mark as watched',
    allWatched: 'All watched. Nothing left in this list.',
    crossoverHeader: (name: string, count: number) =>
      `Crossover ${name} · ${count} episodes back to back`,
    crossoverNext: (part: number, parts: number, name: string, next: string) =>
      `Part ${part} of ${parts} of ${name}: continue with ${next}.`,
    crossoverLast: (name: string) => `Last part of ${name}.`,
    importance: { essential: 'Essential', recommended: 'Recommended', optional: 'Optional' },
    movie: 'Film',
    filters: 'Filters',
    seriesFilter: 'Series',
    importanceFilter: 'Importance',
    showAll: 'All',
    withoutOptional: 'No optional',
    essentialOnly: 'Essentials',
    hideWatched: 'Hide watched',
    showTitles: 'Show titles',
    crossoverMap: 'Crossovers',
    crossoversOnly: 'Crossovers only',
    noMatch: 'Nothing with these filters.',
    curatedBy: 'Curated by',
    authors: 'List by',
    githubProfile: (handle: string) => `${handle} on GitHub`,
    storageUnavailable:
      'This browser does not keep data for this site, so your progress will be lost when you leave.',
  },
  footer: {
    localProgress: 'Free and account-free: your progress stays on this device.',
    tmdbNotice:
      'Images and data: TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.',
    licences: 'Lists CC BY-SA 4.0, code MIT.',
    nav: 'Footer',
    suggestList: 'Suggest a list on GitHub',
    about: 'About',
    sourceCode: 'Source code on GitHub',
  },
};

export type Dictionary = typeof en;
