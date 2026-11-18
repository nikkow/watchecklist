export const en = {
  meta: {
    title: 'watchecklist: Watch Orders for Shared TV Universes',
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
    description:
      'Who makes watchecklist, how your progress stays on your device, where the watch orders and the TMDB data come from.',
    intro:
      'watchecklist is a free checklist for watching the episodes and films of a shared universe in the right order, crossovers included.',
    privacyTitle: 'No account, no cookies',
    privacy: 'Your progress is stored in this browser only. There is no account and no cookie.',
    stats:
      'Visits are counted anonymously with an instance of Matomo hosted by Keiko, a France-based startup owned by the site author: no cookie, no visitor identifier, masked IP address, data kept 25 months at most, never shared.',
    statsChoice: 'Count my visits in the anonymous statistics',
    dataTitle: 'Data sources',
    data: 'Watch orders are edited by hand and published under CC BY-SA 4.0. Titles, dates and images come from TMDB.',
    tmdbLink: 'The Movie Database (TMDB)',
    codeTitle: 'Open source',
    code: 'The code is released under the MIT licence.',
  },
  list: {
    backToLists: 'Back to lists',
    metaTitle: (name: string) => `${name} Watch Order, Spoiler-Free`,
    watchOrder: 'watch order',
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
  install: {
    title: 'Install watchecklist',
    body: 'Open your lists from the home screen and tick episodes even offline.',
    iosSteps: 'In Safari, tap Share, then Add to Home Screen.',
    button: 'Install the app',
    dismiss: 'Not now',
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
